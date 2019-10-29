import React from 'react';
import CanvasJSReact from '../../assets/canvasjs.react';
import axios from 'axios';
import keys from '../../config/keys.js';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import './Investments.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import ModalHeader from 'react-bootstrap/ModalHeader';
import ModalBody from 'react-bootstrap/ModalBody';
import ModalTitle from 'react-bootstrap/ModalTitle';
import Form from 'react-bootstrap/Form';
import FormCheck from 'react-bootstrap/FormCheck';
import { isNullOrUndefined } from 'util';
import Loader from "../Loader/Loader";
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
class StocksGraph extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data: [],
            defaultRate: "Weekly",
            company: "MSFT",
            companyName: "Microsoft",
            frequency: "TIME_SERIES_WEEKLY_ADJUSTED",
            key: keys.AlphaVantageAPIKey,
            show: false,
            show2: false,
            companies: {
                "Amazon": {"id":"AMZN","tracked":false},
                "Apple": {"id":"AAPL","tracked":false},
                "Google": {"id":"GOOG","tracked":false},
                "Microsoft": {"id":"MSFT","tracked":false},
            },
            investments: [],
            selectedCompanies: [],
            showInfo: false,
            uid: sessionStorage.getItem('user'),
            enteredInvestment: 0,
            enteredInvestmentDate: "",
            newInvestment: {},
            companyOptions: {},
        }
        console.log("GRAPHS");
    }

    componentDidMount(){
        const test = {uid: this.state.uid};
        console.log(this.state.uid);
        axios.get("http://localhost:8080/Cheddar/Investments", {
            params: test,
                }).then(res => {
                    var companies = this.state.companies;
                    var i;
                    var trackedCompanies = res.data.trackedCompanies;
                    for(i=0;i<trackedCompanies.length;i++){
                        companies[trackedCompanies[i]]["tracked"]=true;
                    }
                    this.setState({
                        companies: companies,
                        selectedCompanies: res.data.trackedCompanies,
                        investments: res.data.investments,
                    });
            //console.log(res);
        });
        if(this.state.defaultRate == "Daily"){
            if(this.state.frequency != "TIME_SERIES_DAILY_ADJUSTED"){
                this.setState({frequency: "TIME_SERIES_DAILY_ADJUSTED"},
                    () =>{
                        //this.makeApiRequest();
                    }
                );
            }
            else{
                //this.makeApiRequest();
            }            
        }
        else if(this.state.defaultRate == "Weekly") {
            if(this.state.frequency != "TIME_SERIES_WEEKLY_ADJUSTED"){
                this.setState({frequency: "TIME_SERIES_WEEKLY_ADJUSTED"},
                    () =>{
                        //this.makeApiRequest();
                    }
                );
            }
            else{
                //this.makeApiRequest();
            }       
        }
            this.getOptions(this.props.companyName,"Weekly");
    }

    getOptions = async (companyName,frequency) => {
        let res = await axios.get("https://www.alphavantage.co/query?function="+this.state.frequency+"&symbol="+ this.state.companies[companyName]["id"]+"&apikey="+this.state.key);
        console.log("TESTING");
        console.log(res);
        var dateKeys = Object.keys(res.data["Weekly Adjusted Time Series"]);
        var points = [];
        var i = 0;
        for(i=0;i<52;i++){
            points.push({x: new Date(dateKeys[i]), y: Math.floor(res.data["Weekly Adjusted Time Series"][dateKeys[i]]["4. close"])});
        }
        var dataArr = []
        dataArr.push({type: "line", dataPoints: points});
        console.log(dataArr);
        const options = {
            title: {
                text: "Weekly "+companyName+" Closings for 1 Year"
            },
            axisX: {
                valueFormatString: "MM/DD/YY",
                title: "Date",
            },
            axisY:{
                title: "Stock closing price ($)",
            },
            data: dataArr,
        }
        var companyOptions = this.state.companyOptions;
        console.log(companyName);
        console.log(options);
        companyOptions[companyName] = options;
        this.setState({
            companyOptions: companyOptions,
        });
    }

    render() {
        return(
            
            <Row>
                {
                    (Object.keys(this.state.companyOptions).length > 0) ?
                <CanvasJSChart options={this.state.companyOptions[this.props.companyName]}
                // onRef = {ref => this.chart = ref}
                />                
                : <Loader/>
                }
            </Row>

                                
        )
    }

}

export default StocksGraph;