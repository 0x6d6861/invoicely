/// <reference path="../pb_data/types.d.ts" />

// Registers a custom API endpoint POST /api/billing/run-cycle
routerAdd("POST", "/api/billing/run-cycle", (c) => {
    // 1. Fetch all active subscriptions that have hit their period end date
    const nowIso = new Date().toISOString();

    const subscriptions = $app.dao().findRecordsByFilter(
        "subscriptions",
        "status = 'active' && current_period_end <= {:now}",
        "-current_period_end",
        100, // Process in chunks of 100
        0,
        { now: nowIso }
    );

    let invoicesCreated = 0;

    // Use a transaction to ensure all database writes succeed or roll back together
    $app.dao().runInTransaction((txDao) => {
        for (let sub of subscriptions) {
            const customerId = sub.get("customer");
            const subscriptionId = sub.id;
            const currentStart = sub.get("current_period_start");
            const currentEnd = sub.get("current_period_end");

            // 2. Fetch calculations from our SQLite View Collection for this cycle
            const usageRecords = txDao.findRecordsByFilter(
                "current_cycle_usage_billing",
                "subscription = {:subId}",
                "",
                0,
                0,
                { subId: subscriptionId }
            );

            if (usageRecords.length === 0) continue;

            // Extract plan details from the first joined view item
            const firstRow = usageRecords[0];
            const planName = firstRow.get("plan_name");
            const basePrice = firstRow.get("plan_base_price");

            // 3. Create the parent Invoice record (Header)
            const invoiceCollection = txDao.findCollectionByNameOrId("invoices");
            const invoice = new Record(invoiceCollection);

            // Generate a unique invoice number (e.g., INV-1718105600)
            const uniqueNum = "INV-" + Math.floor(Date.now() / 1000);

            invoice.set("customer", customerId);
            invoice.set("invoice_number", uniqueNum);
            invoice.set("status", "sent");
            invoice.set("issue_date", nowIso);
            // Due date set to 14 days from now
            invoice.set("due_date", new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString());

            // Save initial header placeholders
            invoice.set("subtotal_amount", 0.00);
            invoice.set("tax_amount", 0.00);
            invoice.set("discount_amount", 0.00);
            invoice.set("total_amount", 0.00);

            txDao.saveRecord(invoice);

            let calculatedSubtotal = 0.00;
            const itemCollection = txDao.findCollectionByNameOrId("invoice_items");

            // 4. Add the Base Subscription Plan Fee Line Item (if greater than 0)
            if (basePrice > 0) {
                const baseItem = new Record(itemCollection);
                baseItem.set("invoice", invoice.id);
                baseItem.set("description", `${planName} - Base Recurring Subscription`);
                baseItem.set("unit_price", basePrice);
                baseItem.set("quantity", 1);
                baseItem.set("tax_rate", 0.00);
                baseItem.set("line_total", basePrice);
                txDao.saveRecord(baseItem);

                calculatedSubtotal += basePrice;
            }

            // 5. Add Metered Usage Line Items
            for (let usage of usageRecords) {
                const totalUnits = usage.get("total_units_used");
                if (totalUnits <= 0) continue; // Skip items with no activity

                const unitPrice = usage.get("unit_price");
                const lineTotal = usage.get("metered_charge_subtotal");
                const metricName = usage.get("metric_name");

                const usageItem = new Record(itemCollection);
                usageItem.set("invoice", invoice.id);
                usageItem.set("description", `Usage: ${metricName} (${totalUnits} units)`);
                usageItem.set("unit_price", unitPrice);
                usageItem.set("quantity", totalUnits);
                usageItem.set("tax_rate", 0.00);
                usageItem.set("line_total", lineTotal);
                txDao.saveRecord(usageItem);

                calculatedSubtotal += lineTotal;
            }

            // 6. Update the Invoice Header with final aggregated totals
            const taxRate = 0.00; // Adjust as needed for local regulations
            const calculatedTax = calculatedSubtotal * taxRate;
            const calculatedTotal = calculatedSubtotal + calculatedTax;

            invoice.set("subtotal_amount", calculatedSubtotal);
            invoice.set("tax_amount", calculatedTax);
            invoice.set("total_amount", calculatedTotal);
            txDao.saveRecord(invoice);

            // 7. Bump subscription period forward for the next month
            const newStart = currentEnd;
            const parsedEnd = new Date(currentEnd);
            parsedEnd.setMonth(parsedEnd.getMonth() + 1); // Advance 1 month
            const newEnd = parsedEnd.toISOString();

            sub.set("current_period_start", newStart);
            sub.set("current_period_end", newEnd);
            txDao.saveRecord(sub);

            invoicesCreated++;
        }
    });

    return c.json(200, {
        status: "success",
        message: `Processed billing cycle. Invoices generated: ${invoicesCreated}`
    });
}, $apis.requireAdminAuth()); // Restricts endpoint access strictly to PocketBase Admin accounts
