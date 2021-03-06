import React, { useState, useEffect } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Row, Col } from 'reactstrap';
import SelectBudgetForm from './SelectBudgetForm';
import DateFinder from "./DateFinder";
import TransactionTable from '../Budgets/TransactionTable';
import axios from 'axios';
import buildUrl from "../../actions/connect";
import '../../css/Transactions.css';


function Transactions() {

	const [userID, setUID] = useState(sessionStorage.getItem('user'));
	// Transactions and date states
	const [selectedBudget, setSelectedBudget] = useState("All Budgets");  // What budget to retrieve transactions from
	const [rawBudgetList, setRawBudgetList] = useState([]);	// list of budgets minus "all budgets"
	const [budgetList, setBudgetList] = useState([]);	// List of budgets
	const [currentBudget, setCurrentBudget] = useState();	// Currently selected Budget
	// const [transactions, setTransactions] = useState(); // Transcations between two dates
	const [spendingByCategory, setSpendingByCategory] = useState([]);	// categories and spending
	const [endDate, setEndDate] = useState(); // Time the backend understand
	const [startDate, setStartDate] = useState(); // Time the backend understand     new Date((new Date()).getTime() - (24 * 3600 * 1000))
	// Chart states
	const [hoverData, setHoverData] = useState(); // Show the value at each point when hovered over
	const [dayList, setDayList] = useState(); // Array of each day's spending
	const [totalChartData, setTotalChartData] = useState();	// Obj containing total chart data
	const [currChartData, setCurrChartData] = useState();	// Obj containing current chart data
	// Error states
	const [error, setError] = useState(); // Error message
	// Utility states
	const [loading, setLoading] = useState(false); // Stops page from loading is a server call is running

	let date = new Date();

	let transactions = [];
	let currTransCats = [[],[],[],[],[],[],[]];
	let currTransNames = [[],[],[],[],[],[],[]];
	let categories = [[],[],[],[],[],[],[]]; //amount spent for each transaction
	let categoryAmounts = [0,0,0,0,0,0,0];
	let categoryNames = ["Entertainment", "Food and Groceries", "Savings", "Debt", "Housing", "Gas", "Utilities"];
	let transNames = [[], [], [], [], [], [], []];

	const calcTotals = () => {
		let totalTitle = "Total Spending";
		let currTitle = "Current Spending";
		console.log(transactions);

		for (let x = 0; x < budgetList.length - 1; x++) {
			for(let y = 0; y < budgetList[x].budgetCategories.length; y++) {
				if(budgetList[x].budgetCategories[y].name === "Entertainment") {
					categoryAmounts[0] += budgetList[x].budgetCategories[y].amount;
				}
				else if(budgetList[x].budgetCategories[y].name === "Food and Groceries") {
					categoryAmounts[1] += budgetList[x].budgetCategories[y].amount;
				}
				else if(budgetList[x].budgetCategories[y].name === "Savings") {
					categoryAmounts[2] += budgetList[x].budgetCategories[y].amount;
				}
				else if(budgetList[x].budgetCategories[y].name === "Debt") {
					categoryAmounts[3] += budgetList[x].budgetCategories[y].amount;
				}
				else if(budgetList[x].budgetCategories[y].name === "Housing") {
					categoryAmounts[4] += budgetList[x].budgetCategories[y].amount;
				}
				else if(budgetList[x].budgetCategories[y].name === "Gas") {
					categoryAmounts[5] += budgetList[x].budgetCategories[y].amount;
				}
				else if(budgetList[x].budgetCategories[y].name === "Utilities") {
					categoryAmounts[6] += budgetList[x].budgetCategories[y].amount;
				}
				else {
					for(let i = 0; i < categoryNames.length; i++) {
						if(budgetList[x].budgetCategories[y].name === categoryNames[i]) {
							categoryAmounts[i] = budgetList[x].budgetCategories[y].amount;
							break;
						}
					}
					categoryNames.push(budgetList[x].budgetCategories[y].name);
					categoryAmounts.push(budgetList[x].budgetCategories[y].amount)
					transNames.push([]);
					categories.push([]);
					currTransNames.push([]);
					currTransCats.push([]);
				}
			}
		}

		//for(let z = 0; z < budgetList[x].budgetCategories[y].transactions.length; z++) {
			for(let k = 0; k < transactions.length; k++) {
				let delim = transactions[k].shortDate.indexOf("/");
				let transDate = parseInt(transactions[k].shortDate.substring(0, delim)) - 1;
				console.log(transDate);
				console.log(date.getMonth());
				//if(transactions[k]._id === budgetList[x].budgetCategories[y].transactions[z]) {
					if(transactions[k].category === "Entertainment") {
						categories[0].push(transactions[k].amount);
						transNames[0].push(transactions[k].name);
						if(date.getMonth() == transDate) {
							currTransCats[0].push(transactions[k].amount);
							currTransNames[0].push(transactions[k].name);
						}
					}
					else if(transactions[k].category === "Food and Groceries") {
						categories[1].push(transactions[k].amount);
						transNames[1].push(transactions[k].name);
						if(date.getMonth() == transDate) {
							currTransCats[1].push(transactions[k].amount);
							currTransNames[1].push(transactions[k].name);
						}
					}
					else if(transactions[k].category === "Savings") {
						categories[2].push(transactions[k].amount);
						transNames[2].push(transactions[k].name);
						if(date.getMonth() == transDate) {
							currTransCats[2].push(transactions[k].amount);
							currTransNames[2].push(transactions[k].name);
						}
					}
					else if(transactions[k].category === "Debt") {
						categories[3].push(transactions[k].amount);
						transNames[3].push(transactions[k].name);
						if(date.getMonth() == transDate) {
							currTransCats[3].push(transactions[k].amount);
							currTransNames[3].push(transactions[k].name);
						}
					}
					else if(transactions[k].category === "Housing") {
						categories[4].push(transactions[k].amount);
						transNames[4].push(transactions[k].name);
						if(date.getMonth() == transDate) {
							currTransCats[4].push(transactions[k].amount);
							currTransNames[4].push(transactions[k].name);
						}
					}
					else if(transactions[k].category === "Gas") {
						categories[5].push(transactions[k].amount);
						transNames[5].push(transactions[k].name);
						if(date.getMonth() == transDate) {
							currTransCats[5].push(transactions[k].amount);
							currTransNames[5].push(transactions[k].name);
						}
					}
					else if(transactions[k].category === "Utilities") {
						categories[6].push(transactions[k].amount);
						transNames[6].push(transactions[k].name);
						if(date.getMonth() == transDate) {
							currTransCats[6].push(transactions[k].amount);
							currTransNames[6].push(transactions[k].name);
						}
					}
					else {
						for(let i = 0; i < categoryNames.length; i++) {
							if(transactions[k].category === categoryNames[i]) {
								categories[i].push(transactions[k].amount);
								transNames[i].push(transactions[k].name);
								if(date.getMonth() == transDate) {
									currTransCats[i].push(transactions[k].amount);
									currTransNames[i].push(transactions[k].name);
								}
								break;
							}
						}
					}
					//break;
				//}
			}
		//}

		console.log(currTransNames);

		let series = [];

		for(let a = 0; a < categories.length; a++) {
			for(let b = 0; b < categories[a].length; b++) {
				let data = [];
				for(let c = 0; c < categories.length; c++) {
					data.push(0);
				}
				data[a] = categories[a][b]
				let newobj = {
					name: transNames[a][b],
					data: data,
					stack: "Spent"
				}
				series.push(newobj);
			}
		}


		let totalOptions = {

    chart: {
        type: 'bar'
    },
    title: {
        text: totalTitle
    },
    xAxis: {
        categories: categoryNames,
        title: {
            text: null
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Dollars $',
            align: 'middle'
        },
        labels: {
            overflow: 'justify'
        }
    },
		legend: {
        enabled: false
    },
    tooltip: {
			formatter: function () {
					return '<b>' + this.x + '</b><br/>' +
							this.series.name + ': ' + '$' + this.y + '<br/>' +
							'Total: $' + this.point.stackTotal;
			}
    },
    plotOptions: {
        bar: {
						stacking: 'normal'
        }
    },
    credits: {
        enabled: false
    },
    series: series
	}

	let currSeries = [];

	for(let a = 0; a < currTransCats.length; a++) {
		for(let b = 0; b < currTransCats[a].length; b++) {
			let data = [];
			for(let c = 0; c < currTransCats.length; c++) {
				data.push(0);
			}
			data[a] = currTransCats[a][b]
			let newobj = {
				name: currTransNames[a][b],
				data: data,
				stack: "Spent"
			}
			currSeries.push(newobj);
		}
	}
	currSeries.push({
		name: "Allotted",
		data: categoryAmounts,
		stack: "Allotted"
	});

	let currOptions = {

	chart: {
			type: 'bar'
	},
	title: {
			text: currTitle
	},
	xAxis: {
			categories: categoryNames,
			title: {
					text: null
			}
	},
	yAxis: {
			min: 0,
			title: {
					text: 'Dollars $',
					align: 'middle'
			},
			labels: {
					overflow: 'justify'
			}
	},
	legend: {
			enabled: false
	},
	tooltip: {
		formatter: function () {
				return '<b>' + this.x + '</b><br/>' +
						this.series.name + ': ' + '$' + this.y + '<br/>' +
						'Total: $' + this.point.stackTotal;
		}
	},
	plotOptions: {
			bar: {
					stacking: 'normal'
			}
	},
	credits: {
			enabled: false
	},
	series: currSeries
}


		setTotalChartData(totalOptions);
		setCurrChartData(currOptions);
	}

	/**
	 * Server call to get all transactions in a given time frame
	 */
	 const getTimeTransactions = () => {

 		let queryOne = `startYear=${startDate.getFullYear()}&startMonth=${startDate.getMonth()}&startDay=${startDate.getDate()}`;
 		let queryTwo = `&endYear=${endDate.getFullYear()}&endMonth=${endDate.getMonth()}&endDay=${endDate.getDate() + 1}`;
 		let query = queryOne + queryTwo;

 		axios.get(buildUrl(`/Cheddar/Transactions/DateRange/${userID}?${query}`))
 			.then(function (response) {
 				// handle success
 				for (let i in response.data) {
 					let date = new Date(response.data[i].date);
 					response.data[i].shortDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
 					//console.log(response.data[i].shortDate);
 				}
				// Update the transaction state
				transactions = response.data;
				calcTotals();

 			})
 			.catch((error) => {
 				console.log("Transaction call did not work");
 				console.log(error);
 			});
 	};

	/**
 	* Server call to get all the transaction data for a specific budget in the database
 	*/
	const getBudgetTransactions = () => {

		let queryOne = `startYear=${startDate.getFullYear()}&startMonth=${startDate.getMonth()}&startDay=${startDate.getDate()}`;
		let queryTwo = `&endYear=${endDate.getFullYear()}&endMonth=${endDate.getMonth()}&endDay=${endDate.getDate() + 1}`;
		let query = queryOne + queryTwo;

		axios.get(buildUrl(`/Cheddar/Budgets/Transactions/DateRange/${userID}?${query}`))
			.then(function (response) {
				// handle success
				for (let i in response.data) {
					// Get current budget
					let date = new Date(response.data[i].date);
					response.data[i].shortDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
				}

				// Update the transaction state
				transactions = response.data;
				calcTotals();
			})
			.catch((error) => {
				console.log("Transaction call did not work  " + error);
			});
	};

	/**
	 * Server call to get all Budgets
	 */
	const getBudgets = () => {
		setLoading(true);
		axios.get(buildUrl(`/Cheddar/Budgets/${userID}`))
			.then(function (response) {
				// handle success

				setBudgetList([...response.data, { name: "All Budgets" }]);
				setRawBudgetList(response.data);
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
		userID: userID,
		getBudgetTransactions: getBudgetTransactions,
		getTimeTransactions: getTimeTransactions,
		calcTotals: calcTotals,
		startDate: startDate,
		setStartDate: setStartDate,
		endDate: endDate,
		setEndDate: setEndDate,
		budgetList: budgetList,
		rawBudgetList: rawBudgetList,
		setSelectedBudget: setSelectedBudget,
		selectedBudget: selectedBudget,
		spendingByCategory: spendingByCategory,
		setSpendingByCategory: setSpendingByCategory
	}

	return (
		<div >
			<h3 className="addSpace">Summary</h3>
			<Row className="padTop">
				<Col sm={4} />
				<Col sm={4}>
					<DateFinder {...propData} />
				</Col>
				<Col sm={4} />
				<Col sm={4} >

				</Col>
				<Col sm={1} />
			</Row>
			<Row>
				<Col sm={2} />
				<Col sm={8}>

						<HighchartsReact
							allowChartUpdate={true}
							highcharts={Highcharts}
							options={totalChartData}
						/>


				</Col>
				<Col sm={1} />

				<Col sm={1} />
			</Row>
			<Row>
				<Col sm={2} />
				<Col sm={8}>

						<HighchartsReact
							allowChartUpdate={true}
							highcharts={Highcharts}
							options={currChartData}
						/>


				</Col>
				<Col sm={1} />

				<Col sm={1} />
			</Row>

		</div>
	);

};

export default Transactions;
