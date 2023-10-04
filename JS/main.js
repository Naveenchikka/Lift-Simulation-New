const form = document.querySelector(".form");
const FloorCountEl =  document.getElementById("NumberOfFloors");
const LiftCountEl = document.getElementById("NumberOfLifts");

let noOfFloors = 0;
let noOfLifts = 0;
let upButton;
let downButton;

let liftDataStore = [];
let requestQueue = [];
let sameFloorRequestQueue = [];
let isLiftFree = true;

function clearInputValues() {
  FloorCountEl.value = "";
  LiftCountEl.value = "";
}

function findNearestIdleLift(targetFloor){
  let nearestLift = null;
  let shortestDistance = Infinity;

  for(const lift of liftDataStore) {
      if(lift.state === "idle") {
          const distance = Math.abs(targetFloor - lift.currentFloor);
          if(distance < shortestDistance) {
              shortestDistance = distance;
              nearestLift = lift.liftId;
          }
      }
  }
  return nearestLift;
}

function checkIfAnyLiftIsFree() {
  for(const lift of liftDataStore) {
      if(lift.state === "idle") {
          isLiftFree = true;
          return isLiftFree;
      }else {
          isLiftFree = false;
      }
  }
  return isLiftFree
}

function createBuildings() {
const mainDiv = document.createElement("div");
mainDiv.id = 'Main';
mainDiv.classList.add("main");
const backButton = document.createElement("button");
backButton.classList.add("backButton");
backButton.innerText = "Back";
backButton.name = "Back";
const liftSection = document.createElement("div");
liftSection.id = 'LiftSection';
liftSection.classList.add("liftSection");
  mainDiv.append(backButton,liftSection);
  document.body.append(mainDiv);
  for(let i = noOfFloors-1;i>=0;i--)
  { 
  const floorsDiv = document.createElement('div');
  floorsDiv.classList.add("floor-container");
  floorsDiv.classList.add(`row-${i}`)
  floorsDiv.style.height = '4.5rem';
   const lineSplit =  document.createElement('div');
   lineSplit.classList.add("lineSplit");
   const floorContents = document.createElement('div');
   floorContents.classList.add("floorContents");
   const buttonContainer = document.createElement('div');
   buttonContainer.classList.add("buttonContainer");
 
   if(i !== 0 && i !== noOfFloors-1)
   {
   upButton = document.createElement('button');
   upButton.innerHTML = `Up`;
   upButton.classList.add("btn");
   upButton.setAttribute("data-floor", i);
   downButton = document.createElement('button');
   downButton.innerHTML = `Down`;
   downButton.classList.add("btn");
   downButton.setAttribute("data-floor", i);
   buttonContainer.append(upButton,downButton);
   }
   else if(i == noOfFloors-1)
   {
   downButton = document.createElement('button');
   downButton.innerHTML = `Down`;
   downButton.classList.add("btn");
   downButton.setAttribute("data-floor", i);
   buttonContainer.append(downButton);
   }
   else
   {
    upButton = document.createElement('button');
    upButton.innerHTML = `Up`;
    upButton.classList.add("btn");
    upButton.setAttribute("data-floor", i);
    buttonContainer.append(upButton);
   }
   floorContents.append(buttonContainer);

   //Lifts Creation
   if(i == 0)
   {
    generateLiftsData(noOfLifts);
   for(let j = 0; j< noOfLifts; j++) 
   {
    const lift = document.createElement("div");
    lift.classList.add("lift");
    lift.id = `lift-${j+1}`;
    const leftDoor = document.createElement("div");
    leftDoor.classList.add("left-door");
    leftDoor.id = `leftDoor-${j+1}`
    const rightDoor = document.createElement("div");
    rightDoor.classList.add("right-door");
    rightDoor.id = `rightDoor-${j+1}`;
    lift.append(leftDoor,rightDoor);
    floorContents.append(lift);
    }
   }
   const floorLabel = document.createElement("div");
   floorLabel.setAttribute("class","floorLabel");
   floorLabel.innerHTML = `Floor ${i}`;
   floorContents.append(floorLabel);
   floorsDiv.append(floorContents,lineSplit);
   liftSection.append(floorsDiv);
  }
 
  backButton.addEventListener("click",()=> {
    const formSection = document.getElementById("form-section");
    formSection.classList.remove("hidden");
     
    const mainSection = document.querySelector(".main");
    mainSection.remove();
   
    liftDataStore = [];
    requestQueue = [];
    noOfFloors = 0;
    noOfLifts = 0;
   });

  function isLiftOnFloor(liftHeight) {
    // Get all the lifts
    const lifts = document.querySelectorAll('.lift');
    for (const lift of lifts) 
    {
        if (lift.style.transform === `translateY(${liftHeight})`) {
          const liftId = lift.id;
          return { isPresent: true, liftId: liftId };
        }
    }
    return { isPresent: false, liftId: null };
  }

 
 liftSection.addEventListener("click", (event) => {
    const floorNumber = event.target.dataset.floor;
    const button = event.target;
    const direction = button?.innerHTML?.toLowerCase();
    const liftHeight = -4.5 * floorNumber + 'rem';
    const isLiftPresent = isLiftOnFloor(liftHeight);
    const liftNumber = isLiftPresent?.liftId?.match(/\d+/)[0];
    const leftDoor = document.querySelector(`#leftDoor-${liftNumber}`);

  if(isLiftPresent?.isPresent)
  {
    // liftDataStore.forEach((lift)=>{
    //      if(lift?.liftId === Number(liftNumber) && lift?.state === 'idle')
    //      {
    //         moveLift(floorNumber,Number(liftNumber));
    //         isLiftFree = false;
    //      }
    //      else if(lift?.liftId === Number(liftNumber) && lift?.state !== 'idle')
    //      {
    //         requestQueue.push({sameFloor: true,floorNumber,direction:direction,liftNumber:Number(liftNumber)});
    //      }
    // });
    const liftInfo = liftDataStore.find(lift => lift.liftId === Number(liftNumber));
    if(liftInfo.state === 'idle')
    {
        moveLift(floorNumber,Number(liftNumber));
        isLiftFree = false;
    }
  }
  else
  {
    const nearestIdleLift = findNearestIdleLift(floorNumber);
    if (checkIfAnyLiftIsFree() && nearestIdleLift) {
      if (nearestIdleLift) {
        moveLift(floorNumber, nearestIdleLift);
        isLiftFree = false;
      }
    } else {
      requestQueue.push({floorNumber, direction: direction,liftNumber: Number(liftNumber)});
    }
  }
});

}

async function moveLift(destinationFloor, liftNumber)
{
    const lift = document.querySelector(`#lift-${liftNumber}`);
    const leftDoor = document.querySelector(`#leftDoor-${liftNumber}`);
    const rightDoor = document.querySelector(`#rightDoor-${liftNumber}`);
    const liftHeight = 4.5; // Height of each floor container
    const currentFloor = liftDataStore[liftNumber-1].currentFloor;

    if(destinationFloor > currentFloor) {
      liftDataStore[liftNumber-1].state = "up"
    }
    else {
      liftDataStore[liftNumber-1].state = "down"
     }

    const animationDuration = 2;
    const floorDistance = Math.abs(currentFloor - destinationFloor);
    const totalAnimationDuration = floorDistance * animationDuration;
    let translateYDistance = -((destinationFloor) * liftHeight);

    lift.style.transition = `transform ${totalAnimationDuration}s ease-in-out`;
    lift.style.transform = `translateY(${translateYDistance}rem)`;
    liftDataStore[liftNumber-1].currentFloor = destinationFloor; 
  
  //Wait for the lift to reach the target floor
   await new Promise(resolve => setTimeout(resolve, totalAnimationDuration * 1000));

  
    // Create a promise that resolves when the transition ends
  //   const transitionEndPromise = new Promise(resolve => {
  //     const transitionEndHandler = () => {
  //         resolve();
  //         lift.removeEventListener('transitionend', transitionEndHandler);
  //     };
  //     lift.addEventListener('transitionend', transitionEndHandler);
  // });

  // await transitionEndPromise;
  
  //Open the doors
  openDoors(lift, leftDoor, rightDoor);

  await new Promise(resolve => setTimeout(resolve, 2500));
  closeDoors(lift,leftDoor, rightDoor,liftNumber);
  // liftDataStore[liftNumber-1].state = "idle";
}

function openDoors(lift, leftDoor, rightDoor) 
{
  lift.classList.add("opened-door");
  leftDoor.classList.add("closed-door");
  rightDoor.classList.add("closed-door");
  openLeftDoor(leftDoor);
  openRightDoor(rightDoor);
}

function closeDoors(lift,leftDoor,rightDoor,liftNumber) 
{
  leftDoor.style.transform = `translateX(0)`;
  leftDoor.style.transition = `transform 2.5s ease-in-out`;
  rightDoor.style.transform = `translateX(0)`;
  rightDoor.style.transition = `transform 2.5s ease-in-out`;
  
  // Add transitionend listener for closing doors
  leftDoor.addEventListener("transitionend", () => {
      liftDataStore[liftNumber-1].state = "idle";
      lift.classList.remove("opened-door");
      leftDoor.classList.remove("closed-door");
      leftDoor.style.transition = "";

    //   if(sameFloorRequestQueue.length > 0)
    //   {
    //     const request = sameFloorRequestQueue.shift();
    //     moveLift(request.floorNumber, request.liftNumber);
    //     isLiftFree = false;
    //   }
    //   else {
    //     isLiftFree = true;
    //   }
      // Check if there are requests in the queue
      if (requestQueue.length > 0) {
          const nextRequest = requestQueue.shift();
          if (nextRequest?.floorNumber) {
              const nearestIdleLift = findNearestIdleLift(nextRequest.floorNumber);
              if(nearestIdleLift) {
                  moveLift(nextRequest.floorNumber, nearestIdleLift);
                  isLiftFree = false;
              }
          }
      } else {
          isLiftFree = true;
      }
  }, { once: true });

  rightDoor.addEventListener("transitionend", () => {
      rightDoor.classList.remove("closed-door");
      rightDoor.style.transition = "";
  }, { once: true });

}

function openLeftDoor(leftDoor) {
  leftDoor.style.transform = `translateX(-1.25rem)`;
  leftDoor.style.transition = `transform 2.5s ease-in-out`;
}

function openRightDoor(rightDoor) {
  rightDoor.style.transform = `translateX(1.25rem)`;
  rightDoor.style.transition = `transform 2.5s ease-in-out`;
}

function generateLiftsData(liftCount) {
  for(let i=0; i<liftCount; i++){
      let liftData = {
          liftId: i+1,
          state: "idle",
          currentFloor: 0
      }
      liftDataStore.push(liftData);
  }
}

const validateData = () => {
    let isValid = true;
    if (noOfFloors > 10 || noOfFloors < 1) {
      isValid = false;
      window.alert("No of floors must be between 1 an 10");
      window.reload
    } else if (noOfLifts > 10 || noOfLifts < 1) {
      isValid = false;
      window.alert("No of lifts must be between 1 an 10");
      clearInputValues();
    } else if (noOfLifts > noOfFloors) {
      isValid = false;
      window.alert("No of lifts can't be more than no of floors");
      clearInputValues();
    }
    return isValid;
};

validateForm = () =>
{
  event.preventDefault();
  const formSection = document.getElementById("form-section");
  formSection.classList.add("hidden");
   noOfFloors = Number(FloorCountEl.value);
   noOfLifts = Number(LiftCountEl.value);
   const isValidData = validateData();
   if(!isValidData)
  { 
     formSection.classList.remove("hidden");
     return;
  }

   createBuildings();
   document.removeEventListener('keydown',keydownHandler);
};
const keydownHandler = (event) => {
  if (event.keyCode === 13) {
    event.preventDefault(); // Prevent the default Enter key behavior
    validateForm();    // Call validateForm function
  }
};

document.addEventListener('keydown', keydownHandler);

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

window.addEventListener('DOMContentLoaded', () => {
  const LiftCountEl = document.getElementById("NumberOfLifts");

  if (isMobileDevice()) {
      // If it's a mobile device, set max lifts to 5
      LiftCountEl.setAttribute('max', '5');
      LiftCountEl.setAttribute('placeholder', 'Max 5 Lifts');
  }
});

// Function to check if device mode is changed
const checkDeviceModeChange = () => {
  const isDeviceModeChanged = window.matchMedia("(hover: none)").matches;

  if (isDeviceModeChanged && !document.activeElement.tagName.toLowerCase().match(/input|textarea|div|button/)) {
      location.reload(); // Reload the page
  }
};

// Add an event listener to check for device mode changes
window.addEventListener('resize', checkDeviceModeChange);
