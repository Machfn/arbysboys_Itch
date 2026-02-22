#include <Stepper.h>
#include <Servo.h>
#include <LED.h>

Stepper motor(100,8,9,10,11);
void setup() {

motor.setSpeed(60);
}

void loop() {

motor.step(100);
delay(500);
}
