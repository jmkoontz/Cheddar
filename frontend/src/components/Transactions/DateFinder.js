import React, { useState, useEffect } from "react";
import { Button, Row, Col, Card, CardHeader, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Label } from 'reactstrap';
import DatePicker from "react-datepicker";
import '../../css/Transactions.css';

function DateFinder(props) {

  const [localEnd, setLocalEnd] = useState(); // Ending date
  const [localStart, setLocalStart] = useState(); // Starting date
  const [budgetDrop, setBudgetDrop] = useState(); // Opens and closes budgets
  const [selectedBudget, setSelectedBudget] = useState("All Budgets");  // What budget to retrieve transactions from

  /**
   * Set state and prop start date
   */
  const setStart = (date) => {
    props.setStartDate(date);
    setLocalStart(date);
  }

  /**
    * Set state and prop end date
    */
  const setEnd = (date) => {
    props.setEndDate(date);
    setLocalEnd(date);
  }

  /**
   * Helper function to make transaction data call
   */
  const handleFetch = () => {

    if (selectedBudget === "All Budgets") {
      props.getTimeTransactions();
    } else {
      console.log(selectedBudget)
      props.getBudgetTransactions(selectedBudget)
    }
  }

  return (
    <Card id={"transaction-finder"}>
      <CardHeader>
        Enter Date Range
			</CardHeader>
      <CardBody>
        <Row>
          <Col >
            <p>Start Date</p>
            <DatePicker
              id="date"
              selected={props.startDate}
              onChange={d => setStart(new Date(d))}
              maxDate={new Date()}
              required={true}
            />
          </Col>
          <Col >
            <p>End Date</p>
            <DatePicker
              id="date"
              selected={props.endDate}
              onChange={d => setEnd(new Date(d))}
              maxDate={new Date()}
              required={true}
            />
          </Col>
        </Row>
        <Row className="padTop">
          
          <Col sm={6}>
            <Label for="budgetName">Select a Budget</Label>
            <Dropdown id="budgetName" isOpen={budgetDrop} toggle={() => setBudgetDrop(!budgetDrop)}>
              <DropdownToggle caret>
                {selectedBudget}
              </DropdownToggle>
              {props.budgetList
              ?
              <DropdownMenu>
                {props.budgetList.map((item, index) =>
                  <DropdownItem key={index} onClick={() => {setSelectedBudget(item.name); props.setSelectedBudget(item)}}>{item.name}</DropdownItem>
                )}
              </DropdownMenu>
              :
              <DropdownMenu/>
              }
            </Dropdown>
          </Col>
          <Col sm={6}>
            {props.startDate && props.endDate && props.endDate.getTime() > props.startDate.getTime()
              ?
              <Button color="primary" onClick={handleFetch}>Get Transactions</Button>
              :
              <Button color="primary" disabled>Get Transactions</Button>
            }

          </Col>
        </Row>

      </CardBody>
    </Card>
  );

};
export default DateFinder;