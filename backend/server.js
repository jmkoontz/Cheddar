import express from 'express';
import bodyParser from 'body-parser';

import db from './config/db';
import mainController from './controllers/mainController';
import budgetController from './controllers/budgetController';
import investmentsController from './controllers/investmentsController';
import transactionController from './controllers/transactionController';
import calendarController from './controllers/calendarController';
import savingsController from './controllers/savingsController';
import debtController from './controllers/debtController';

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.options('/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.sendStatus(200);
});

// run controllers
investmentsController(app);
mainController(app);
budgetController(app);

transactionController(app);
calendarController(app);
savingsController(app);
debtController(app);

// listen to port
let port = process.env.PORT;
if (port == null || port === '')
  port = 8080;

app.listen(port, () => {
  console.log('Now listening on port ' + port);
});
