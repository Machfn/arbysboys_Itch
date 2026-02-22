#include <Stepper.h>
#include <Servo.h>
#include <LED.h>

Servo SERVO;
Servo second_servo;
void setup() {

SERVO.attach(11);
second_servo.attach(9);
}

void loop() {

SERVO.write(45);
delay(100);
}
