/*
* (print is equivalent to write in logs.txt file)
* tracker = new tracker() -> print timestamp on first line --- get project name
*
* tracker.start() -> print project started
*
* tracker.request(method, router) -> print method -> router
* +] default router '/', default method 'get'
* +] methods -> 'get' 'post' 'put' 'delete' 'patch'
*
* tracker.error(actual_error) -> print actual_error --- generate actual_error
* +] actual_error should be eq 'throw new Error(error)'
*
* tracker.db_connection(dbname) -> print dbname connected
*
* tracker.relationaldb_query(query) -> print relational query
*
* tracker.nosqldb_query(operation, value, value_updated) -> print nosql query
* +] operation -> 'select' 'insert' 'update' 'delete'
* +] default value_updated is null, it should be set in case of update
*
* tracker.custome(msg, type) -> print type : msg
* */

const fs = require('fs');

class tracker {

    constructor(inf = {infinity_ : false}) {
        // console.time("Constr time");
        this.project_name = (JSON.parse(fs.readFileSync('package.json'))).name || "App";
        this.json_log = {
            name : this.project_name,
            start : tracker.generate_string_timestamp(),
            routers : {GET : {total:0, routes : {}}, POST : {total:0, routes : {}}, DELETE : {total:0, routes:{}}, PUT : {total:0, routes:{}}},
            db : {tables : {}}
        };

        let log = tracker.generate_string_timestamp() + " " + this.project_name + "\r\n";

        if(inf.infinity_)
            tracker.append_file('\r\n'+log);
        else
            this.write_file(log+'\r\n');
        // console.timeEnd("Constr time");
    }

    start() {
        // console.time("Start");
        let timestamp = tracker.generate_string_timestamp();
        let log = tracker.prefix + "started.";
        this._start = true;
        tracker.append_file(log);
        // console.timeEnd("Start");
    }

    request(method = "GET", route = "/") {
        // console.time("Request time");
        try {
            method = method.toUpperCase();
            if (method === "GET" || method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
                let log = tracker.prefix + method + " -> " + route;
                tracker.append_file(log);

                this.json_log.routers[method].total++;
                if(this.json_log.routers[method].routes.hasOwnProperty(route))
                    this.json_log.routers[method].routes[route]++;
                else
                    this.json_log.routers[method].routes[route] = 1;

            } else throw "Invalid method " + method;
        } catch (err) {
            throw new Error(err);
        }
        // console.timeEnd("Request time");
    }

    error(err) {
        let log = tracker.prefix + `${err.toString()}`;

        fs.appendFile('logs.txt', log, () => {
            throw err;
        });
    }

    db_connection(dbname) {
        // console.time("Db conn time");
            this.dbname = dbname;
            this.json_log.db.name = dbname;
            let log = tracker.prefix + `${dbname} Connected.`;

            tracker.append_file(log);
        // console.timeEnd("Db conn time");
    }

    nosqldb_query(table, operation, value, value_updated = null) {
        // console.time("nosql query time");
            try {
                if(!this.dbname) throw "Set name of database... use .db_connection(dbname) method";
                if(tracker._invalid(table)) throw "First argument must be string";
                if(tracker._invalid(operation)) throw "Second argument must be string";
                operation = operation.toUpperCase();
                if(tracker.invalid_operation(operation)) throw "Invalid Database operation " + operation;
                if(!value) throw "Second argument must be defined...";

                let log = tracker.prefix + this.dbname + " : On Table " + table + ", ";

                switch (operation) {
                    case "SELECT" :
                    case "INSERT" :
                    case "DELETE" :
                        log += operation + " -> " + JSON.stringify(value);
                        break;
                    case "UPDATE" :
                        if(value_updated === null) throw "Third argument should not be null in case of UPDATE";
                        log += operation + " " + JSON.stringify(value) + " -> " + JSON.stringify(value_updated);
                        break;
                    default :
                        throw new Error("Operation should be either one of these SELECT, INSERT, UPDATE and DELETE");
                }
                tracker.append_file(log);
                this.db_json_updater(table, operation);
            } catch (err) {
                throw new Error(err);
            }
            // console.timeEnd("nosql query time");
    }


    relational_db_query(table, operation, query) {
        // console.time("relational query time");
        try {
            if(!this.dbname) throw "Set name of database... use .db_connection(dbname) method";
            if(tracker._invalid(table)) throw "First argument must be string";
            if(tracker._invalid(operation)) throw "Second argument must be string";
            if(tracker._invalid(query)) throw "Third argument must be string";
            let log = tracker.prefix + this.dbname + " : " + query;
            tracker.append_file(log);
            this.db_json_updater(table, operation);
        } catch (e) {
            throw new Error(e);
        }
        // console.timeEnd("relational query time");
    }

    custom(msg, type = null) {
        // console.time("Custom time");
        try {
            if(!msg) throw "First argument must be passed";
            let log = tracker.prefix + ((type !== null) ? type + " : " : "") + msg;
            tracker.append_file(log);
        } catch (e) {
            throw new Error(e);
        }
        // console.timeEnd("Custom time");
    }

    get get_json() {
        return JSON.stringify(this.json_log, null, " ");
    }

     db_json_updater(table, operation) {
        if(this.json_log.db.tables.hasOwnProperty(table))
        {
            if(this.json_log.db.tables[table].hasOwnProperty(operation))
                this.json_log.db.tables[table][operation]++;
            else
                this.json_log.db.tables[table][operation] = 1;
        } else {
            this.json_log.db.tables[table] = {};
            this.json_log.db.tables[table][operation] = 1;
        }
    }

    write_file(log) {
        fs.writeFile('logs.txt', log, (error) => {
            if(error) throw new Error(error);
        });
    }

    static append_file(log) {
        let logstrm = fs.createWriteStream('logs.txt', {'flags' : 'a'});

        logstrm.write(log + '\r\n');
        logstrm.end();
    }

    static get prefix() {
        return tracker.generate_string_timestamp() +  "  ";
    }

    static generate_string_timestamp(include_millisecond = false) {
        let d = new Date();

        return "[" + d.toDateString() + " " + d.toTimeString().slice(0, 8) + (include_millisecond ? ":" + d.getMilliseconds() : "") + "]";
    }

    static invalid_operation(operation) {
        return operation !== "SELECT" && operation !== "INSERT" && operation !== "UPDATE" && operation !== "DELETE";
    }

    static _invalid(argument, type = "string") {
        return !argument || typeof argument !== type;
    }
}

module.exports = tracker;
