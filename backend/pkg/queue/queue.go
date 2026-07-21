package queue

import (
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"

	"github.com/pdegama/mailtroapp/pkg/config"
)

// Queue wraps one AMQP connection shared by publishers and consumers.
type Queue struct {
	cfg  *config.Config
	conn *amqp.Connection
}

func Connect(cfg *config.Config) (*Queue, error) {
	url := fmt.Sprintf("amqp://%s:%s@%s:%s/", cfg.AMQPUser, cfg.AMQPPassword, cfg.AMQPHost, cfg.AMQPPort)
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("amqp dial: %w", err)
	}
	log.Println("AMQP connection established")
	return &Queue{cfg: cfg, conn: conn}, nil
}

func (q *Queue) declare(ch *amqp.Channel, name string) error {
	_, err := ch.QueueDeclare(name, true, false, false, false, nil)
	return err
}

// Publish sends a message body to the given queue.
func (q *Queue) Publish(queueName string, body []byte) error {
	ch, err := q.conn.Channel()
	if err != nil {
		return fmt.Errorf("amqp channel: %w", err)
	}
	defer ch.Close()

	if err := q.declare(ch, queueName); err != nil {
		return fmt.Errorf("queue declare %s: %w", queueName, err)
	}

	return ch.Publish("", queueName, false, false, amqp.Publishing{
		DeliveryMode: amqp.Persistent,
		ContentType:  "text/plain",
		Body:         body,
	})
}

// Consume runs handler for every message on queueName; the message is acked
// only when the handler returns nil. Reconnect/retry loops forever.
func (q *Queue) Consume(queueName string, handler func(body []byte) error) {
	for {
		if err := q.consumeOnce(queueName, handler); err != nil {
			log.Printf("consumer %s stopped: %v — retrying in 5s", queueName, err)
		}
		time.Sleep(5 * time.Second)
	}
}

func (q *Queue) consumeOnce(queueName string, handler func(body []byte) error) error {
	ch, err := q.conn.Channel()
	if err != nil {
		return fmt.Errorf("amqp channel: %w", err)
	}
	defer ch.Close()

	if err := q.declare(ch, queueName); err != nil {
		return fmt.Errorf("queue declare %s: %w", queueName, err)
	}

	if err := ch.Qos(8, 0, false); err != nil {
		return fmt.Errorf("qos: %w", err)
	}

	msgs, err := ch.Consume(queueName, "", false, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("consume %s: %w", queueName, err)
	}

	log.Printf("consuming queue %s", queueName)
	for msg := range msgs {
		if err := handler(msg.Body); err != nil {
			log.Printf("queue %s handler error: %v", queueName, err)
			// drop the message; requeueing would loop forever on poison messages
			_ = msg.Nack(false, false)
			continue
		}
		_ = msg.Ack(false)
	}
	return fmt.Errorf("delivery channel closed")
}
