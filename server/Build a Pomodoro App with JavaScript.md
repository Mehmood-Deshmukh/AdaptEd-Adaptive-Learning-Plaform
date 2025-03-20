### Build a Pomodoro App with JavaScript
======================================================

[![Pomodoro App](https://www.codedex.io/images/projects/card_images/build-a-pomodoro-app-with-html-css-js.png)](https://www.codedex.io/projects/build-a-pomodoro-app-with-html-css-js)

#### Prerequisites:
- HTML, CSS, JavaScript fundamentals
- Versions: None
- Read Time: 45 minutes

### Checkpoints
#### # Introduction
Welcome to the Pomodoro timer app coding tutorial! In this project, you'll learn how to create a simple and effective time management tool using just HTML, CSS, and JavaScript. By the end of this tutorial, you'll have a basic understanding of how to build a dynamic web page that responds to user interactions. You'll also learn how to structure and style your HTML elements with CSS, and how to add interactivity with JavaScript.

The final project will look like this:
![Finished Pomodoro App](https://raw.githubusercontent.com/codedex-io/projects/main/projects/build-a-pomodoro-app-with-html-css-js/finished_pomodoro.gif)

#### # What is the Pomodoro Technique?
The Pomodoro Technique is a time management method developed in the late 80s by Francesco Cirillo. The theory behind this technique is that taking frequent breaks can help improve your mental focus and prevent burnout. It can improve mental agility, boost motivation, and provide a better sense of accomplishment by breaking tasks into smaller chunks. For these reasons, this technique is quite popular with programmers.

The idea is to break down work into short intervals, usually 25 minutes, with short breaks in between sessions, usually 5 to 10 minutes. Each interval is known as a pomodoro, Italian word for tomato. The goal is to use each Pomodoro to focus on one specific task, then take a break before starting the next one.

So, let's get started and create a Pomodoro app that will help you increase your productivity and get things done! 🎉

#### # Setting Up
First, we need to set up our file structure so everything is organized and easy to find.

Create a new folder on your computer and name it pomodoro-app.

Then, create the following files inside the folder:

The file structure should look like the following:
![File Structure](https://raw.githubusercontent.com/codedex-io/projects/main/projects/build-a-pomodoro-app-with-html-css-js/app_file_structure.png)

#### # Let's Start Building!
Now that we've got the foundation in place for the Pomodoro app, it's time to start building!

### HTML
In the `<head>` element, a `<title>` element that says "Pomodoro App".
In the `<body>` element, a `<div>` element with an "app-container" class.
After the `<body>` element, a `<script>` element with the src attributed to our app.js file.

HTML features the basic building blocks that define the meaning and structure of web pages.

To start, our index.html file should look like the following:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    Some code will go here
  </head>
  <body>
    A lot more will go here
  </body>
</html>
```
Next, let's add the following:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Pomodoro App</title>
  </head>
  <body>
    <div class="app-container">
    </div>
  </body>
  <script src="./app.js"></script>
</html>
```
This establishes the basic structure for our Pomodoro app.

Next, let's add the following code to the `<head>` element:
```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=EG+Garamond:wght@400;500;600;700&family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./style.css" />
  <title>Pomodoro App</title>
</head>
```
We just added a few `<link>` elements:

In the `<body>`, let's add the following inside the `<div>` element with the app-container class:
```html
<div class="app-container">
  <h1>pomodoro</h1>
  <div class="app-message">press start to begin</div>
  <div class="app-circle">
    <div class="circle-shape">
      <div class="semi-circle right-side circle-mask"></div>
      <div class="semi-circle right-side circle"></div>
      <div class="semi-circle left-side circle-mask"></div>
      <div class="semi-circle left-side circle"></div>
    </div>
    <div class="app-counter-box">
      <p><span class="minutes">25</span>:<span class="seconds">00</span></p>
    </div>
    <button class="btn-start">start</button>
  </div>
</div>
```
Underneath of the `<h1>` element are the main parts of the app:

If we save and then double-click the file, it should open and look like this:
![Rendered HTML Only](https://raw.githubusercontent.com/codedex-io/projects/main/projects/build-a-pomodoro-app-with-html-css-js/rendered_html_only.png)

Awesome work with the HTML! Let's continue to the next step, styling!

### CSS
We are grabbing the text "25" in our session variable and converting it to a Number and assigning that number to sessionAmount
If our state is True, we do the following:
Convert the sessionAmount, the time left, to just seconds.
Define a function called updateSeconds(), (more on that, shortly).
Use the setInverval() Web API function to run our updateSeconds() function every 1 second (or 1000 milliseconds). This is assigned to our myInterval function from earlier, so it can be turned off when the timer reaches 0.

Else, if the state is False, we alert the user that the "Session has already started". This prevents the user from repeatedly clicking on the start button which would cause multiple calls to the updateSeconds() function and would cause the timer to count at an irregular speed.

Now that we have the overall structure of our web application, let's get started on our CSS, which stands for "Cascading Style Sheets". According to the Mozilla Developer Network (MDN):

Basically, this is where we will set up the appearance of our application.

CSS is utilized through class names that are assigned to the HTML elements in our app. They use the following structure:
```css
.class-name {
  /* Content goes here. */
}
```
For example, there is a `<div>` container with an "app-container" class assigned to it. Classes are how we select specific elements within the HTML to style.

With their class names, elements can be selected and styled with CSS, such as with `<div>` division element with the "app-container" class:
```css
.app-container {
  /* Styles go here. */
}
```
To learn more about CSS, visit MDN.

Let's begin by establishing a few high-level styles:
```css
html {
  font-family: 'Fira Sans', sans-serif;
  font-size: 20px;
  letter-spacing: 0.8px;
  min-height: 100vh;
  color: #d8e9ef;
  background-image: linear-gradient(-20deg, #025159 0%, #733b36 100%);
  background-size: cover;
}
```
The styles for the `<html>` element set the font and background of our app.

Next, let's add the following additional styles for our app headings and overall container:
```css
h1 {
  margin: 0 auto 10px auto;
  color: #d8e9ef;
}

p {
  margin: 0;
}

.app-message {
  height: 20px;
  margin: 10px auto 20px auto;
}

.app-container {
  width: 250px;
  height: 420px;
  margin: 40px auto;
  text-align: center;
  border-radius: 5px;
  padding: 20px;
}
```
The margin and padding properties are used to give some spacing between our elements.

Now, let's style the `.app-circle`, which will start with a `.circle-shape`:
```css
.app-circle {
  position: relative;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}

.circle-shape {
  pointer-events: none;
}
```
The `.app-circle` is where the remaining time and start button will be. It is made of two semi-circles for the left-side and right-side. The `.circle-shape` is set so that the rendered circle cannot be clicked.

Let's now apply styles to the `<div>` elements marked with the `.semi-circle`, `.left-side`, and `.right-side` classes:
```css
.semi-circle {
  position: absolute;
  width: 100px;
  height: 200px;
  box-sizing: border-box;
  border: solid 6px;
}

.left-side {
  top: 0;
  left: 0;
  transform-origin: right center;
  transform: rotate(0deg);
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
  border-right: none;
  z-index: 1;
}

.right-side {
  top: 0;
  left: 100px;
  transform-origin: left center;
  transform: rotate(0deg);
  border-top-right-radius: 100px;
  border-bottom-right-radius: 100px;
  border-left: none;
}
```
Then, let's apply these styles:
```css
.circle {
  border-color: #bf5239;
}

.circle-mask {
  border-color: #e85a71;
}
```
This sets the border color for the outline of the circle for our timer. When rendered, the page should have a red ring towards the middle of it.

Lastly, let's add these styles:
```css
.app-counter-box {
  font-family: 'Droid Sans Mono', monospace;
  font-size: 250%;
  position: relative;
  top: 50px;
  color: #d8e9ef;
}

button {
  position: relative;
  top: 50px;
  font-size: 80%;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  background: none;
  outline: none;
  color: #d8e9ef;
}

button:hover {
  color: #90c0d1;
}
```
The `.app-counter-box` contains the remaining time for our timer. We gave it one of the fonts we imported in the previous section.

The selected `<button>` element was set so that only the text is visible and it is uppercase. When hovered, the button's color should change.

Let's go ahead and save our style.css file and refresh our page to see what it now looks like:
![Rendered App No JS](https://raw.githubusercontent.com/codedex-io/projects/main/projects/build-a-pomodoro-app-with-html-css-js/rendered_app_no_js.png)

Excellent! It's time to move on to the final part of our Pomodoro App to make it count down!

### JavaScript
We are grabbing the text "25" in our session variable and converting it to a Number and assigning that number to sessionAmount
If our state is True, we do the following:
Convert the sessionAmount, the time left, to just seconds.
Define a function called updateSeconds(), (more on that, shortly).
Use the setInverval() Web API function to run our updateSeconds() function every 1 second (or 1000 milliseconds). This is assigned to our myInterval function from earlier, so it can be turned off when the timer reaches 0.

Else, if the state is False, we alert the user that the "Session has already started". This prevents the user from repeatedly clicking on the start button which would cause multiple calls to the updateSeconds() function and would cause the timer to count at an irregular speed.

With JavaScript, we can create a simple yet functional Pomodoro App that starts counting down from 25 minutes, second by second, when the start button is clicked.

To learn more about JavaScript, visit MDN.

In our app.js file, let's initialize the following variables:
```javascript
const bells = new Audio('./sounds/bell.wav');
const startBtn = document.querySelector('.btn-start');
const session = document.querySelector('.minutes');
let myInterval;
let state = true;
```
With the bells variable, we are assigning a .wav file that we got from Mixkit. Using the Audio() constructor, we assign the path of the bell sound as a parameter.

Like in CSS, HTML elements must be selected to be used in JavaScript. For the startBtn and session constant variables, we are using the document object's .querySelector() method to select and update elements on the web page. We are selecting the elements through class selectors, .btn-start and .minutes.

For now, we are just instantiating a myInterval variable without assigning it.

The last variable is a state that is assigned the Boolean value True. This defines when the application is running. If it is, the timer will progress. However, if the state is false, there will be an alert that notifies the user that the session has already started.

Awesome! Now that our variables have been declared and initialized, we can move on to the main functionality that brings this all together, the appTimer() function.
```javascript
const appTimer = () => {
  const sessionAmount = Number.parseInt(session.textContent)

  if(state) {
    state = false;
    let totalSeconds = sessionAmount * 60;

    const updateSeconds = () => {
      // Function code here.
    }
    myInterval = setInterval(updateSeconds, 1000);
  } else {
    alert('Session has already started.')
  }
}
```
Inside the appTimer() function there are a few things happening:

Earlier, we defined a function called updateSeconds(). In this function, we are grabbing two `<div>` elements called 'minuteDiv' and 'secondDiv':
```javascript
const updateSeconds = () => {
  const minuteDiv = document.querySelector('.minutes');
  const secondDiv = document.querySelector('.seconds');

  totalSeconds--;

  let minutesLeft = Math.floor(totalSeconds/60);
  let secondsLeft = totalSeconds % 60;

  if(secondsLeft < 10) {
    secondDiv.textContent = '0' + secondsLeft;
  } else {
    secondDiv.textContent = secondsLeft;
  }
  minuteDiv.textContent = `${minutesLeft}`

  if(minutesLeft === 0 && secondsLeft === 0) {
    bells.play()
    clearInterval(myInterval);