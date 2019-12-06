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
import '../App.css';
import StocksGraph from "./StocksGraph";
import GrowthGraph from "./GrowthGraph";
import buildUrl from "../../actions/connect";
import TipSequence from "../TipSequence/TipSequence"

//Constant variable that contains investments tips to be used later

const tips = (
    <Modal.Body>
                    <div>
                    1. Goals<br/>
                        Make sure you have a long term goal in mind. Know why you are deciding to invest.
                    </div>
                    <div>
                    2. Understand the risk<br/>
                        It is very possible you may lose the money you invest. Investing in a more established
                        and stable firm can be safer than a startup. However, nothing is guarunteed. Do not
                        invest if you are not willing to lose it.
                        </div>
                    <div>
                    3. Be rational and logical<br/>
                        If you decide to buy or sell stock, make sure you are doing so on the basis of fact and
                        not emotion. It can be exciting to gain money or upsetting when you lose, however
                        it is important to be rational and make logical decisions.
                        </div>
                    <div>
                    4. Stick to the basics<br/>
                        When first starting out it will help to learn about different types of investments,
                        definitions of metrics, and fundamental methods of stock selection and timing.
                        </div>
                    <div>
                    5. Diversify risk<br/>
                        Do not invest solely in one company. Be open to investing in various markets. When
                        one market is not doing well, it is possible another is which can help balance out
                        losses from the poorly performing markets.
                        </div>
                    <div>
                    6. Avoid Leverage<br/>
                        Do not invest money you do not have. Starting out, it can be dangerous when stocks
                        decrease in a way that is unexpected. Avoid investing loaned money until you have
                        become a well established investor.
                        </div>
                    <div>    
                        <br/>
                    Source: https://www.moneycrashers.com/stock-market-investing-tips-guide-checklist/

                    Lewis, Michael, et al. “6 Stock Market Investing Tips &amp; Guide for Beginners - Checklist.
                        ” Money Crashers, 10 July 2019, www.moneycrashers.com/stock-market-investing-tips
                        -guide-checklist/.
                        </div>
                </Modal.Body>
);

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
class Investments extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: {},
            defaultRate: "Daily",
            company: "MSFT",
            companyName: "Microsoft",
            frequency: "TIME_SERIES_DAILY_ADJUSTED",
            frequencyCounter: 5,
            key: keys.AlphaVantageAPIKey,
            show: false,
            show2: false,
            disableAddCompanyTip: true,
            disableDoneButtonTip: true,
            disableEditInvestmentTip: true,
            
            companies: {
                "Amazon": {"id":"AMZN","tracked":false},
                "Apple": {"id":"AAPL","tracked":false},
                "Google": {"id":"GOOG","tracked":false},
                "Microsoft": {"id":"MSFT","tracked":false},
                "American Eagle Outfitters": {"id":"AEO","tracked":false},
                "Starbucks": {"id":"SBUX","tracked":false},
                "Facebook": {"id":"FB","tracked":false},
                "AT&T": {"id":"T","tracked":false},
                "Netflix": {"id":"NFLX","tracked":false},
                "Ford Motor Company": {"id":"F","tracked":false},
                "Target": {"id":"TGT","tracked":false},
                "Bank of America": {"id":"BAC","tracked":false},
                "Exxon Mobil": {"id":"XOM","tracked":false},
                "Tesla Inc": {"id":"TSLA","tracked":false},
                "Yum! Brands Inc": {"id":"YUM","tracked":false},
            },
            investments: [],
            selectedCompanies: [],
            showInfo: false,
            uid: sessionStorage.getItem('user'),
            enteredInvestment: 0,
            enteredInvestmentDate: "",
            enteredInvestmentShares: 1,
            newInvestment: {},
            companyOptions: {},
            isMounted: false,
        }
    }

    //when component mounts, get investment data
    componentDidMount(){
        const test = {uid: this.state.uid};
        axios.get(buildUrl("/Cheddar/Investments"), {
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
                    },() => {
                        if(this.state.selectedCompanies.length > 0){
                            this.setState({
                                disableDoneButtonTip: false,
                            });
                        }
                        else{
                            this.setState({
                                disableDoneButtonTip: true,
                            });
                        }
                        var comps = this.state.selectedCompanies;
                        let i =0;
                        for(i = 0;i < comps.length; i++){
                            this.getData(comps[i]);
                        }
                    });
        });
    }

        shouldComponentUpdate(nextProps,nextState){
        
        if(this.state.key != nextState.key){
            return false;
        }
        else if(this.state.key == nextState.key){
            return true;
        }
    }

//function to update state with stock abbreviation for a particular company
    test = (param) => {
        var name = "";
        switch(param){
            case "Microsoft":
                name = "MSFT";
                break;
            case "Apple":
                name = "AAPL";
                break;
            case "Amazon":
                name = "AMZN";
                break;
            case "Google":
                name = "GOOG";
                break;
            case "American Eagle Outfitters":
                name = "AEO";
                break;
            case "Starbucks":
                name = "SBUX";
                break;
            case "Facebook":
                name = "FB";
                break;
            case "AT&T":
                name = "T";
                break;
            case "Netflix":
                name = "NFLX";
                break;
            case "Ford Motor Company":
                name = "F";
                break;
            case "Target":
                name = "TGT";
                break;
            case "Bank of America":
                name = "BAC";
                break;
            case "Exxon Mobil":
                name = "XOM";
                break;
            case "Tesla Inc":
                name = "TSLA";
                break;
            case "Yum! Brands Inc":
                name = "YUM";
                break;
        }
        this.setState({
            company: name,
            companyName: param,
        });
    }

//toggles modal for various companies
    showModal = () => {
        var show = this.state.show;
        this.setState({
            show: !this.state.show,
            disableAddCompanyTip: false,
        });
    }

//toggles modal for add/update investment 
    showModal2 = () => {
        this.setState({
            show2: !this.state.show2,
        });
    }

//toggles modal for investment info
    showInfoModal = (name) => {
        if(name === undefined){
            this.setState({
                showInfo: !this.state.showInfo,
            });
        }
        else{
        this.setState({
            showInfo: !this.state.showInfo,
            companyName: name,
        });
    }
    }

//takes a newly selected company and updates tracked companies in database via post request
    addSelectedCompany = (company) => {
        var originalCompanies = this.state.companies;
        var companies = this.state.selectedCompanies;        


        if(originalCompanies[company]["tracked"] == true){
            originalCompanies[company]["tracked"] = false;
            if(companies.includes(company)){
                companies.splice(companies.indexOf(company),1);
            }
            axios.post(buildUrl("/Cheddar/Investments/TrackedCompanies"), {
                "uid": this.state.uid,
                "updatedCompanies": companies,
                }).then(res => {
                    this.setState({
                        companies: originalCompanies,
                        selectedCompanies: companies,
                    });
            });
        }
        else{
            originalCompanies[company]["tracked"] = true;
            if(!companies.includes(company)){
                companies.push(company);
            }

            axios.post(buildUrl("/Cheddar/Investments/TrackedCompanies"), {
                "uid": this.state.uid,
                updatedCompanies: companies,
                }).then(res => {
                    this.setState({
                        selectedCompanies: companies,
                        companies: originalCompanies,
                    },()=>{this.getData(company)});
            });
        }
        if(companies.length > 0){
                this.setState({
                    disableDoneButtonTip: false,
                });
            }
            else{
                this.setState({
                    disableDoneButtonTip: true,
                });
            }
        this.getData(company);
        
    }

//updates state with new investment amount for the current company
    updateInvestedAmount = (amount) => {
        this.setState({
            enteredInvestment: amount.target.value,
        });
    }

//updates state with new investment date for the current company
    updateInvestmentDate = (date) => {
        this.setState({
            enteredInvestmentDate: date.target.value,
        });
    }

//updates state with new investment number of shares for the current company
    updateInvestmentShares = (shares) => {
        this.setState({
            enteredInvestmentShares: shares.target.value,
        });
    }

//updates state of investment to be marked as a favorite
    updateInvestmentFavorite = (favorite) => {
        var value = false;
        if(favorite.target.value == "on"){
            value = true;
        }

        this.setState({
            enteredInvestmentFavorite: value,
        });
    }

//updates the investment on the backend
    updateInvestment = () => {
        if(this.state.enteredInvestmentShares == 0 || this.state.enteredInvestmentDate === ""){
            alert("Please fill out all fields");
            return;
        }
        let investment = {};
        var dateKeys = Object.keys(this.state.data[this.state.companyName].data["Time Series (Daily)"]);
        investment["type"] = "stock";
        investment["startingInvestment"] = this.state.enteredInvestment;
        investment["currentShareValue"] = this.state.data[this.state.companyName].data["Time Series (Daily)"][dateKeys[0]]["4. close"];
        investment["shares"] = this.state.enteredInvestmentShares;
        investment["startDate"] = this.state.enteredInvestmentDate;
        investment["favorite"] = this.state.enteredInvestmentFavorite;
        investment["company"] = this.state.companyName;
        this.setState({
            newInvestment: investment,
            enteredInvestment: 0,
            enteredInvestmentDate: "",
        });
        let i = 0;
        var proceed = true;
        var investments = this.state.investments;
        for(i=0;i<this.state.investments.length;i++){
            if(this.state.investments[i]){
                if(investments[i].company && investments[i].company == this.state.companyName){
                    investments.splice(i,1);
                    break;
                    
                }
            }
        }
        if(proceed){
            investments.splice(i,0,investment);
            axios.post(buildUrl("/Cheddar/Investments"), {
                "uid": this.state.uid,
                "investments": investments,
            }).then(res => {
                this.showInfoModal();
            });
        }
        
    }

    //updates the state with desired frequency for the graphs
    setFrequency = (frequency) => {
        var newFrequencyCounter;
        if(frequency === "Weekly"){
            newFrequencyCounter = 5;
        }
        else{
            newFrequencyCounter = 1;
        }
        this.setState({
            defaultRate: frequency,
            data: {},
            frequencyCounter: newFrequencyCounter,
        },() => {
            var comps = this.state.selectedCompanies;
            let i =0;
            for(i = 0;i < comps.length; i++){
                this.getData(comps[i]);
            }});
    }

    //get API data for particular company and update state
    getData = async (companyName) => {
        let res;
        res = await axios.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="+ this.state.companies[companyName]["id"]+"&apikey="+this.state.key+"&outputsize=full");
        if(res.data.Note && res.data.Note.includes("API call frequency")){
            //change API keys
            if(this.state.key == keys.AlphaVantageAPIKey){
                this.setState({
                    key: keys.AlphaVantageAPIKey2,
                },() => {this.getData(companyName)});
            }
            else if(this.state.key == keys.AlphaVantageAPIKey2){
                this.setState({
                    key: keys.AlphaVantageAPIKey3,
                },() => {this.getData(companyName)});
            }
            else if(this.state.key == keys.AlphaVantageAPIKey3){
                this.setState({
                    key: keys.AlphaVantageAPIKey4,
                },() => {this.getData(companyName)});
            }
            else if(this.state.key == keys.AlphaVantageAPIKey4){
                this.setState({
                    key: keys.AlphaVantageAPIKey5,
                },() => {this.getData(companyName)});
            }
            else if(this.state.key == keys.AlphaVantageAPIKey5){
                this.setState({
                    key: keys.AlphaVantageAPIKey6,
                },() => {this.getData(companyName)});
            }
            else if(this.state.key == keys.AlphaVantageAPIKey6){
                this.setState({
                    key: keys.AlphaVantageAPIKey,
                },() => {this.getData(companyName)});
            }
            //alert("Changing Keys");
        }
        else{
            var data = this.state.data;
            data[companyName] = res;
            this.setState({
                data: data,
            });
        }
    }

    emptyGraph = () => {
        if(this.state.selectedCompanies.length == 0){
            return null;
        }
        else{
            return (<Loader/>)
        }
    }
    emptyGrowthGraph = () => {
        if(this.state.investments.length == 0){
            return null;
        }
        else{
            return (<Loader/>)
        }
    }

    enableToolTips = () => {
        axios.put(buildUrl(`/Cheddar/EnableToolTips/${sessionStorage.getItem('user')}/investments`))
        .then(()=>{
            window.location.reload();
        })
      .catch((error) => {
        console.log(error);
      });
    }

    render () {
        return (
            <div className="parent">
                
                {/* Container that contains the frequency button and Add Company button */}
                <Container className="topMargin bottomMargin" fluid="true">
                    <Row>
                        <Col sm={3}>
                            <Button id="add-button" className="add-company-button" variant="primary" onClick={this.showModal}>Add Company</Button>
                            
                        </Col>
                        <Col sm={1}>
                            <DropdownButton id="dropdown-frequency-button" title={this.state.defaultRate}>
                                <Dropdown.Item id="frequency-dropitem-daily" onSelect={() => {this.setFrequency("Daily")}}>Daily</Dropdown.Item>
                                <Dropdown.Item id="frequency-propitem-weekly" onSelect={() => {this.setFrequency("Weekly")}}>Weekly</Dropdown.Item>
                            </DropdownButton>
                        </Col>
                        <Col sm={4}>
                            <h3 id="page-header">Track Investments</h3>
                        </Col>
                        
                        <Col sm={3} className="text-right">
                            <Button id="stocks-tips" variant="link" onClick={this.showModal2}>Investment<br/>Tips</Button>
                        </Col>
                        <Col sm={1} className="text-right">
                            <Button id="tool-tips" variant="link" onClick={()=>{this.enableToolTips()}}>Tool<br/>Tips</Button>
                        </Col>
                    </Row>
                </Container>

                {/* Container that contains all stocks and growth graphs */}
                <div id="all-graphs-div-container" className="cardContainer">
                    <Container fluid="true">
                        <Row>
                            <Col id="stocks-graphs-col" className="card">
                                {
                                    /* If all desired stock data is loaded and the number of companies to show is greater than 0
                                    then iterate through each of the selected companies and return a stocks graph and update button.
                                    Otherwise, return the loader. */
                                    (Object.keys(this.state.data).length >= 1) ?
                                        this.state.selectedCompanies.map((name,index)=>{
                                            console.log(name+"Graph");
                                            if(this.state.data[name]){
                                            return(
                                                <div>
                                                    <StocksGraph frequency={this.state.defaultRate} data={this.state.data[name]} key={name+"Graph"} companyName={name}/>
                                                    <Button key={name+"GraphButton"} onClick={() => {this.showInfoModal(name)}}>Add/Edit Investment</Button>
                                                </div>
                                            )
                                            }
                                            else{
                                                return(
                                                    <div>
                                                    </div>
                                                )
                                            }
                                        }) 
                                    : <Loader/>
                                }
                            </Col>

                            <Col id="growth-graphs-col" className="card">
                                {
                                    /* If all desried stock data is loaded and investments have been gathered from the backend, then iterate
                                       through each investment, determine if the investment should be displayed and return the growth graph
                                       corresponding to the investment. Otherwise, return the loader */
                                    (Object.keys(this.state.data).length >= this.state.selectedCompanies.length && this.state.investments.length > 0) ?
                                        this.state.investments.map((investment,index)=>{
                                            if(this.state.selectedCompanies.includes(investment["company"])){
                                                return(
                                                    <GrowthGraph frequency={this.state.defaultRate} investment={investment} companyName={investment["company"]} data={this.state.data[investment["company"]]} key={investment["company"]+"GrowthGraph"} companyName={investment["company"]}/>
                                                )
                                            }
                                            else{
                                                return null
                                            }
                                        }) 
                                    : <Loader/>
                                }
                                
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* Modal that shows stock tips */}
                <Modal show={this.state.show2} onHide={this.showModal2} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                        Stocks Tips
                        </Modal.Title>
                    </Modal.Header>
                    {tips}
                </Modal>

                {/* Modal that shows available companies to view */}
                <Modal show={this.state.show} onHide={this.showModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Select Companies
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                                {
                                    /* For each supported company, determine if the company is tracked and return a new form row
                                       and new form checkbox representing that company */
                                    Object.keys(this.state.companies).map((name) => {
                                        var checkedd = false;
                                        if(this.state.companies[name]["tracked"] == true){
                                            checkedd = true;
                                        }
                                        return (
                                            <Form.Row key={name+"row"}>
                                                <Form.Check key={name+this.state.companies[name]["id"]} type="checkbox" label={name} checked={checkedd} onChange={() => this.addSelectedCompany(name)}/>
                                            </Form.Row>        
                                        )
                                    })
                                }
                            <Button id="select-companies-done-button" variant="primary" onClick={this.showModal}>
                                Done
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Modal containing a form to add or update an investment */}
                <Modal show={this.state.showInfo} onHide={this.showInfoModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Enter Investment Information for {this.state.companyName}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formBasic">
                                <Form.Label>Investment Shares</Form.Label>
                                <Form.Control id="investment-shares-input" as="input" type="number" defaultValue={this.state.updateInvestmentShares} onChange={(event)=>{this.updateInvestmentShares(event)}}/>
                                <Form.Label>Date Invested</Form.Label>
                                <Form.Control id="investment-date-input" as="input" type="date" defaultValue={this.state.updateInvestmentDate} onChange={(event)=>{this.updateInvestmentDate(event)}}/>
                                <Form.Label>Favorite</Form.Label>
                                <Form.Control id="investment-favorite-checkbox" as="input" type="checkbox" onChange={(event)=>{this.updateInvestmentFavorite(event)}}/>
                            </Form.Group>
                            <Button id="edit-investment-submit-button" variant="primary" onClick={() => this.updateInvestment()}>
                                Submit
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                <TipSequence
                    page={"investments"}
                    tips={[
                        {
                        text: "The investment page is the place to view how various company stocks are doing and how your investments in those companies are doing!",
                        target: "page-header"
                        }, {
                        text: "Click the \"Add Company\" button to select a company you wish to see stock data on",
                        target: "add-button",
                        }, {
                        text: "Click this button to show a dropdown of graph frequency options",
                        target: "dropdown-frequency-button",
                        }, {
                        text: "The column on the left will display closing stock prices for your selected companies and a button to add a current investment you hold at the company",
                        target: "all-graphs-div-container",
                        }, {
                        text: "The column on the right will display your investment growth in a particular company",
                        target: "all-graphs-div-container",
                        },{
                            text: "Click here to read about some investing tips",
                        target: "stocks-tips",
                        }, {
                            text: "After closing out these tips, click here to show them again",
                        target: "tool-tips",
                        }, 
                        
                        
                    ]}
                    />
            </div>
        );
    }
}

export default Investments; 