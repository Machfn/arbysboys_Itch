#include <Stepper.h>
#include <Servo.h>
#include <LED.h>

Stepper MOTOR(100,6,5,4,3);
void setup() {

MOTOR.setSpeed(100);
pinMode(11, INPUT);
pinMode(21, OUTPUT);
}

void loop() {

digitalWrite(21, HIGH);
MOTOR.step(100);
int lk;
lk = 40;
lk = digitalRead(11);
}
