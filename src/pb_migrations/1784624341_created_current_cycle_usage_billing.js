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
        "cascadeDelete": false,
        "collectionId": "pbc_3980638064",
        "help": "",
        "hidden": false,
        "id": "relation2747688147",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "subscription",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_108570809",
        "help": "",
        "hidden": false,
        "id": "_clone_X1gT",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "customer",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_lccf",
        "max": "",
        "min": "",
        "name": "current_period_start",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_L7Qi",
        "max": "",
        "min": "",
        "name": "current_period_end",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "_clone_Fb2e",
        "max": 0,
        "min": 0,
        "name": "plan_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_8iTo",
        "max": null,
        "min": null,
        "name": "plan_base_price",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2503664009",
        "help": "",
        "hidden": false,
        "id": "relation2278960867",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "metric",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "_clone_Wb8B",
        "max": 0,
        "min": 0,
        "name": "metric_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_xvIT",
        "max": null,
        "min": null,
        "name": "unit_price",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json727106920",
        "maxSize": 1,
        "name": "total_units_used",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1497973034",
        "maxSize": 1,
        "name": "metered_charge_subtotal",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_3298818137",
    "indexes": [],
    "listRule": null,
    "name": "current_cycle_usage_billing",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT \n    (sub.id || '_' || um.id) AS id,\n    sub.id AS subscription,\n    sub.customer AS customer,\n    sub.current_period_start AS current_period_start,\n    sub.current_period_end AS current_period_end,\n    p.name AS plan_name,\n    p.base_price AS plan_base_price,\n    um.id AS metric,\n    um.metric_name AS metric_name,\n    um.unit_price AS unit_price,\n    COALESCE(SUM(ul.quantity_used), 0.00) AS total_units_used,\n    COALESCE(SUM(ul.quantity_used) * um.unit_price, 0.00) AS metered_charge_subtotal\nFROM subscriptions sub\nJOIN plans p ON sub.plan = p.id\nJOIN usage_metrics um ON p.id = um.plan\nLEFT JOIN usage_ledger ul ON ul.subscription = sub.id \n    AND ul.usage_metric = um.id\n    -- SQLite text-based date comparisons used by PocketBase\n    AND ul.recorded_at >= sub.current_period_start\n    AND ul.recorded_at < sub.current_period_end\nGROUP BY \n    sub.id, \n    sub.customer, \n    sub.current_period_start, \n    sub.current_period_end, \n    p.name, \n    p.base_price, \n    um.id, \n    um.metric_name, \n    um.unit_price;",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298818137");

  return app.delete(collection);
})
