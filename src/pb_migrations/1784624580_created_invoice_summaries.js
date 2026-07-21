/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "_clone_LeTg",
        "max": 0,
        "min": 0,
        "name": "invoice_number",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_108570809",
        "help": "",
        "hidden": false,
        "id": "_clone_o9YH",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "customer",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "_clone_KLfN",
        "max": 0,
        "min": 0,
        "name": "customer_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "exceptDomains": null,
        "help": "",
        "hidden": false,
        "id": "_clone_Tb0d",
        "name": "customer_email",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "email"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_w2RS",
        "maxSelect": 0,
        "name": "status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "draft",
          "sent",
          "paid",
          "void",
          "overdue"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_nbBH",
        "max": "",
        "min": "",
        "name": "issue_date",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_K7nb",
        "max": "",
        "min": "",
        "name": "due_date",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_BYnt",
        "max": null,
        "min": null,
        "name": "total_amount",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json2207660229",
        "maxSize": 1,
        "name": "total_paid",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3165886577",
        "maxSize": 1,
        "name": "remaining_balance",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_4281602592",
    "indexes": [],
    "listRule": null,
    "name": "invoice_summaries",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT \n    i.id AS id, -- Reuses the original invoice ID as the view's primary key\n    i.invoice_number AS invoice_number,\n    i.customer AS customer,\n    c.name AS customer_name,\n    c.email AS customer_email,\n    i.status AS status,\n    i.issue_date AS issue_date,\n    i.due_date AS due_date,\n    i.total_amount AS total_amount,\n    COALESCE(SUM(t.amount_paid), 0.00) AS total_paid,\n    (i.total_amount - COALESCE(SUM(t.amount_paid), 0.00)) AS remaining_balance\nFROM invoices i\nJOIN customers c ON i.customer = c.id\nLEFT JOIN transactions t ON t.invoice = i.id\nGROUP BY \n    i.id,\n    i.invoice_number,\n    i.customer,\n    c.name,\n    c.email,\n    i.status,\n    i.issue_date,\n    i.due_date,\n    i.total_amount;\n",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4281602592");

  return app.delete(collection);
})
