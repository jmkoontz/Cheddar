import React from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Calendar from 'react-calendar';
import axios from 'axios';

import './EventModal.css';
import buildUrl from "../../actions/connect";

class EventModal extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isOpen: false,
      event: {},
      isSaved: true
    };
  }

  open = (event) => {
    this.setState({
      isOpen: true,
      isSaved: true,
      event
    });
  };

  handleSave = () => {
    // Save stuff here
    if (this.props.isNew) {
      axios.post(buildUrl('/Cheddar/Calendar/event/' + sessionStorage.getItem('user')), this.state.event).then((resp) => {
        this.setState({isSaved: true});
        this.handleClose();
      });
    } else {
      axios.put(buildUrl('/Cheddar/Calendar/event/' + sessionStorage.getItem('user')), this.state.event).then((resp) => {
        this.setState({isSaved: true});
        this.handleClose();
      });
    }
  };

  handleDelete = () => {
    // Delete stuff here
    axios.delete(buildUrl('/Cheddar/Calendar/event/' + sessionStorage.getItem('user') + '/' + this.state.event.id), this.state.event).then((resp) => {
      this.setState({isSaved: true});
      this.handleClose();
    });
  };

  handleClose = () => {
    // Check if not saved using state.isSaved
    if (!this.state.isSaved && !window.confirm("You have unsaved changes. Are you sure you want to exit?")) {
      return;
    }

    this.setState({
      isOpen: false
    });

    if (this.props.onClose)
      this.props.onClose();
  };

  setProperty = (name, value) => {
    const newEvent = this.state.event;
    newEvent[name] = value;

    this.setState({
      event: newEvent,
      isSaved: false
    });
  };

  render () {
    const event = this.state.event;

    if (!event)
      return null;

    return (
      <Modal show={this.state.isOpen} onHide={this.handleClose}>
        <Modal.Header closeButton>
          {
            this.props.isNew ?
              <Modal.Title>Add Expense</Modal.Title>
              : <Modal.Title>Edit Expense</Modal.Title>
          }
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={event.title}
                onChange={(e) => {
                  this.setProperty("title", e.target.value);
                }}
                placeholder="Enter title"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Amount Due</Form.Label>
              <Form.Control
                type={"number"}
                value={event.amount}
                onChange={(e) => {
                  this.setProperty("amount", e.target.value);
                }}
                placeholder="$0"
              />
            </Form.Group>

            {
              this.props.isNew ?
                <Form.Group>
                  <Form.Label>Repeat</Form.Label>
                  <Form.Control
                    as="select"
                    value={event.repeat}
                    onChange={(e) => {
                      this.setProperty("repeat", e.target.value);
                    }}
                  >
                    <option>Never</option>
                    <option>Weekly</option>
                    <option>Biweekly</option>
                    <option>Monthly</option>
                  </Form.Control>
                </Form.Group>
                : null
            }

            <Form.Check
              label={"Notify me of this"}
              type="checkbox"
              checked={event.notify}
              onChange={() => {
                this.setProperty("notify", !event.notify);
              }}
            />
            <br/>

            <Form.Group>
              <Form.Label>Selected Date</Form.Label>
              <Calendar
                value={event.start}
                onChange={(date) => {
                  this.setProperty("start", date);
                  this.setProperty("end", date);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
          {this.props.isNew ? null : <Button variant="danger" onClick={this.handleDelete}>Delete</Button>}
          <Button variant="primary" onClick={this.handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EventModal;