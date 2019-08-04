const trackify = require('../tracker');

//init
const tracker = new trackify();

//start
tracker.start();

setTimeout(() => {
	//request
	tracker.request("get", "/");

	setTimeout(() => {
		//request
		tracker.request("get", "/api/user");

		setTimeout(() => {
			//db connection
			tracker.db("MongoDB");

			setTimeout(() => {
				//nosql query
				tracker.nosql_query("tablename", "select", {_id : "uniqueid"});

				setTimeout(() => {
					//relational query
					tracker.relational_query("tablename", "select", "select * from tablename where _id='uniqueid'");

					setTimeout(() => {
						//custom 
						tracker.custom("Custom message", "Custom type");

						setTimeout(() => {
							//error
							tracker.error(new Error("Some error"));
						}, 500);
					}, 500);
				}, 500);
			},500)

		}, 500);
	}, 500);
}, 500);