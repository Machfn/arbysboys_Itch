#include <Stepper.h>
#include <Servo.h>
#include <LED.h>

Servo SERVO;
Servo second_servo;
void setup() {

SERVO.attach(D11);
second_servo.attach(D9);
}

void loop() {

D9.write(45);
delay(100);
}
