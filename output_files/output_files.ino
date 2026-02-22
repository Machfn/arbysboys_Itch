#include <Stepper.h>
#include <Servo.h>
#include <LED.h>

Servo SERVO;
void setup() {

SERVO.attach(6);
pinMode(11, INPUT);
pinMode(9, OUTPUT);
}

void loop() {

int lk;
lk = digitalRead(11);
if(lk == 1){
SERVO.write(70);
delay(100);
}

else{
SERVO.write(15);
delay(100);
}

}
