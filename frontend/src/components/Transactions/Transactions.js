import React, { useState, useEffect } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { Row, Col } from 'reactstrap';
import SelectBudgetForm from './SelectBudgetForm';
import DateFinder from "./DateFinder";
import axios from 'axios';
import '../../css/Transactions.css';


function Transactions(props) {

	const [userID, setUID] = useState(sessionStorage.getItem('user'));
	// Transactions and date states
	const [budgetList, setBudgetList] = useState([]);	// List of budgets
	const [transactions, setTransactions] = useState(); // Transcations between two dates
	const [endDate, setEndDate] = useState(); // Time the backend understand
	const [startDate, setStartDate] = useState(); // Time the backend understand
	// Chart states
	const [hoverData, setHoverData] = useState(); // Show the value at each point when hovered over
	const [dayList, setDayList] = useState(); // Array of each day's spending
	const [chartData, setChartData] = useState(); // Obj containing chart info
	const [totalChartData, setTotalChartData] = useState();	// Obj containing total chart data
	// Error states
	const [error, setError] = useState(); // Error message
	// Utility states
	const [loading, setLoading] = useState(false); // Stops page from loading is a server call is running


	const endDateHelper = (date) => {
		let interval = 1000 * 60 * 60 * 24;
		let end = Math.floor(date / interval) * interval

		setEndDate(new Date(end));
	}

	const startDateHelper = (date) => {
		let interval = 1000 * 60 * 60 * 24;
		let start = Math.floor(date / interval) * interval

		setStartDate(new Date(start));
	}

	/**
	 * Helper method to show each data point on the chart
	 * @param {Object} e 
	 */
	const showHoverData = (e) => {
		setHoverData(e.target.category);
	}


	/**
	 * Helper function to calculate the difference between two dates
	 */
	const calcNumberDays = (end, start) => {
		let newEnd = new Date(end);
		let newStart = new Date(start);
		return Math.floor((newEnd.getTime() - newStart.getTime()) / (24 * 3600 * 1000));
	}

	/**
	 * Sorts all the transactions by date and stores them in their own
	 */
	const sortByDay = (transactionsList) => {
		let numDays = calcNumberDays(endDate, startDate) + 1;
		let daysArray = [];
		let totalDaysArray = [];
		let runningTotal = 0;	// Variable for the total

		// Populate the daysArray with the number of days between the start and end dates
		for (let x = 0; x < numDays; x++) {
			daysArray.push(0);
			totalDaysArray.push(0);
		}

		// Loop over transactions and add their amount to to coresponding daysArray index
		for (let x = 0; x < transactionsList.length; x++) {
			// Add each transaction into its respective array index
			let tmpObj = transactionsList[x];
			let index = calcNumberDays(tmpObj.date, startDate);
			daysArray[index] += tmpObj.amount;

		}

		for (let y = 0; y < daysArray.length; y++) {
			runningTotal += daysArray[y];
			totalDaysArray[y] = runningTotal;
		}

		let dailyOptions = {
			title: {
				text: 'Daily Spending'
			},
			xAxis: {
				type: 'datetime',
				dateTimeLabelFormats: {
					day: '%b %e'
				}
			},
			yAxis: {
				title: {
					text: 'Money Spent'
				}
			},
			series: [{
				name: "Daily Spending",
				data: daysArray,
				pointStart: startDate.getTime(),
				pointInterval: 24 * 3600 * 1000, // one day
				animation: {
					duration: 2000
				}
			}],

			plotOptions: {
				series: {
					point: {
						events: {
							mouseOver: showHoverData
						}
					}
				}
			}
		}

		let totalOptions = {
			title: {
				text: 'Total Spending'
			},
			xAxis: {
				type: 'datetime',
				dateTimeLabelFormats: {
					day: '%b %e'
				}
			},
			yAxis: {
				title: {
					text: 'Money Spent'
				}
			},
			series: [{
				name: "Total Spending",
				data: totalDaysArray,
				color: 'green',
				pointStart: startDate.getTime(),
				pointInterval: 24 * 3600 * 1000, // one day
				animation: {
					duration: 2000
				}
			}],

			plotOptions: {
				series: {
					point: {
						events: {
							mouseOver: showHoverData
						}
					}
				}
			}
		}

		setChartData(dailyOptions);
		setTotalChartData(totalOptions)
		setDayList(daysArray);
	}

	/**
	 * Server call to get all transactions in a given time frame
	 */
	const getTransactions = () => {

		let queryOne = `startYear=${startDate.getFullYear()}&startMonth=${startDate.getMonth()}&startDay=${startDate.getDate()}`;
		let queryTwo = `&endYear=${endDate.getFullYear()}&endMonth=${endDate.getMonth()}&endDay=${endDate.getDate()}`;
		let query = queryOne + queryTwo;

		axios.get(`http://localhost:8080/Cheddar/Transactions/DateRange/${userID}?${query}`)
			.then(function (response) {
				// handle success				
				console.log(response.data)
				setTransactions(response.data);
				// Update the transaction state
				sortByDay(response.data);

			})
			.catch((error) => {
				console.log("Transaction call did not work");
				console.log(error);
			});
	};

	/**
 	* Server call to get all the transaction data for a specific budget in the database
 	*/
	const getBudgetTransactions = (name) => {
		
		axios.get(`http://localhost:8080/Cheddar/Budgets/Budget/Transactions/${userID}/${name}`)
			.then(function (response) {
				// handle success
				console.log(response)
				setTransactions(response.data);
				// Update the transaction state
				sortByDay(response.data);
			})
			.catch((error) => {
				console.log("Transaction call did not work");
			});
	};

	/**
	 * Server call to get all Budgets
	 */
	const getBudgets = () => {
		setLoading(true);
		axios.get(`http://localhost:8080/Cheddar/Budgets/${userID}`)
			.then(function (response) {
				// handle success

				setBudgetList([...response.data,{name:"All Budgets"}]);
				setLoading(false);
			})
			.catch((error) => {
				console.log("Didn't get those budgets sir");
				//TODO: error handling for budgets failing to load
				// if (error.response && error.response.data) {
				//   console.log(error.response.data.error);
				//   if (error.response.data.error.message.errmsg && error.response.data.error.message.errmsg.includes("duplicate")) {
				//     //self.createIt();
				//   }
				// } else {
				//   console.log(error);
				// }
			});
	};

	useEffect(
		() => {
			getBudgets();
		},
		[]
	);

	const propData = {
		getBudgetTransactions: getBudgetTransactions,
		getTransactions: getTransactions,
		startDate: startDate,
		setStartDate: setStartDate,
		endDate: endDate,
		setEndDate: setEndDate,
		budgetList: budgetList
	}

	return (
		<div >
			<h3 className="addSpace">Transactions</h3>
			<Row className="padTop">
				<Col sm={1} />
				<Col sm={5}>
					{dayList
						?
						<HighchartsReact
							allowChartUpdate={true}
							highcharts={Highcharts}
							options={chartData}
						/>
						:
						<div />
					}
				</Col>
				<Col sm={1} />
				<Col sm={4} >
					<DateFinder {...propData} />
				</Col>
				<Col sm={1} />
			</Row>
			<Row>
				<Col sm={1} />
				<Col sm={5}>
					{dayList
						?
						<HighchartsReact
							allowChartUpdate={true}
							highcharts={Highcharts}
							options={totalChartData}
						/>
						:
						<div />
					}

				</Col>
				<Col sm={1} />
				<Col sm={4} >
					<SelectBudgetForm {...propData} />
				</Col>
				<Col sm={1} />
			</Row>

		</div>
	);

};

export default Transactions;