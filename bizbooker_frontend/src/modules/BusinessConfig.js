import React, { useState, useEffect } from 'react';
import { Button, Card, TimePicker, Select, Switch, Form, Row, Col, message } from 'antd';
import axios from 'axios';
import './BusinessConfig.css';
import moment from 'moment';

const { Option } = Select;

const BusinessConfig = ({ businessId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [slotDuration, setSlotDuration] = useState(30);
  const [weeklyHours, setWeeklyHours] = useState([]);

  // Initialize with default hours
  useEffect(() => {
    const defaultHours = Array(7).fill().map((_, day) => ({
      dayOfWeek: day,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: day === 0 || day === 6 // Closed by default on weekends
    }));
    setWeeklyHours(defaultHours);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Save business hours
      await axios.post(`http://localhost:8080/api/business-hours/${businessId}/weekly`, weeklyHours);
      
      // Save slot config
      await axios.post('http://localhost:8080/api/slot-config', {
        locationId: businessId,
        ...values,
        slotDuration
      });
      
      message.success('Configuration saved successfully!');
    } catch (error) {
      message.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateDayHours = (day, field, value) => {
    const updated = [...weeklyHours];
    updated[day] = { ...updated[day], [field]: value };
    setWeeklyHours(updated);
  };

  return (
    <div className="business-config-container">
      <Card title="Business Hours Configuration" className="config-card">
        <div className="hours-grid">
          {weeklyHours.map((day, index) => (
            <div key={index} className="day-card">
              <div className="day-header">
                <Switch
                  checked={!day.isClosed}
                  onChange={(checked) => updateDayHours(index, 'isClosed', !checked)}
                />
                <span className="day-name">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}
                </span>
              </div>
              
              {!day.isClosed && (
                <div className="time-inputs">
                  <TimePicker
                    format="HH:mm"
                    minuteStep={15}
                    value={day.openTime ? moment(day.openTime, 'HH:mm') : null}
                    onChange={(time) => updateDayHours(index, 'openTime', time.format('HH:mm'))}
                    className="time-picker"
                  />
                  <span className="time-separator">to</span>
                  <TimePicker
                    format="HH:mm"
                    minuteStep={15}
                    value={day.closeTime ? moment(day.closeTime, 'HH:mm') : null}
                    onChange={(time) => updateDayHours(index, 'closeTime', time.format('HH:mm'))}
                    className="time-picker"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Slot Configuration" className="config-card">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="maxSlotsPerInterval"
                label="Max Slots Per Interval"
                initialValue={3}
                rules={[{ required: true }]}
              >
                <Select>
                  {[1, 2, 3, 4, 5].map(num => (
                    <Option key={num} value={num}>{num}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Slot Duration (minutes)">
                <Select 
                  value={slotDuration} 
                  onChange={setSlotDuration}
                >
                  {[15, 30, 45, 60].map(duration => (
                    <Option key={duration} value={duration}>{duration}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Button 
        type="primary" 
        size="large" 
        onClick={handleSave}
        loading={loading}
        className="save-button"
      >
        Save Configuration
      </Button>
    </div>
  );
};

export default BusinessConfig;