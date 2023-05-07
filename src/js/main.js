let buttons = document.querySelectorAll(".call-lift-btn");
let floorButton = document.querySelector(".add-floor-button");
let liftButton = document.querySelector(".add-lift-button");
let liftEls = document.querySelectorAll(".lift-container");
let leftDoors = document.querySelectorAll(".left-door");
let rightDoors = document.querySelectorAll(".right-door");
const floorsContainer = document.querySelector(".floor-container");
let floors = document.querySelectorAll(".floor");

class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    return this.items.push(element);
  }

  dequeue() {
    if (this.items.length > 0) {
      return this.items.shift();
    }
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length == 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }
}

const lifts = Array.from(
  document.querySelectorAll(".lift-container"),
  (item) => ({
    htmlElement: item,
    busy: false,
    currentFloor: 0,
  })
);

function getLifts() {
  return lifts;
}

function isLiftOnFloor(floor) {
  for (let i = 0; i < lifts.length; i++) {
    if (lifts[i].currentFloor == floor) {
      return true;
    }
  }
  return false;
}

// function getClosestEmptyLift(destinationFloor, direction) {
//   const currentNumberOfLifts = getLifts();

//   const emptyLifts = currentNumberOfLifts.reduce(
//     (result, value, index) =>
//       result.concat(
//         value.busy === false &&
//           (direction === "down"
//             ? isLiftOnFloor(destinationFloor) === false
//             : true)
//           ? {
//               index,
//               currentFloor: value.currentFloor,
//               distance: Math.abs(destinationFloor - value.currentFloor),
//             }
//           : []
//       ),
//     []
//   );

//   if (emptyLifts.length <= 0) {
//     return { lift: {}, index: -1 };
//   }

//   const closestLift = emptyLifts.reduce((result, value, index) =>
//     value.distance < result.distance ? value : result
//   );

//   const index = closestLift.index;

//   return { lift: lifts[index], index };
// }

function getClosestEmptyLift(destinationFloor, direction) {
  const currentNumberOfLifts = getLifts();

  const emptyLifts = currentNumberOfLifts.reduce(
    (result, value, index) =>
      result.concat(
        value.busy === false &&
          value.currentFloor !== destinationFloor && // Add this condition
          (direction === "down"
            ? isLiftOnFloor(destinationFloor) === false
            : true)
          ? {
              index,
              currentFloor: value.currentFloor,
              distance: Math.abs(destinationFloor - value.currentFloor),
            }
          : []
      ),
    []
  );

  if (emptyLifts.length <= 0) {
    return { lift: {}, index: -1 };
  }

  const closestLift = emptyLifts.reduce((result, value, index) =>
    value.distance < result.distance ? value : result
  );

  const index = closestLift.index;

  return { lift: lifts[index], index };
}

const callLift = (direction) => {
  const destinationFloor = requests.peek();

  if (!isLiftOnFloor(destinationFloor)) {
    const { lift, index } = getClosestEmptyLift(destinationFloor, direction);

    if (index >= 0) {
      lifts[index].busy = true;
      moveLift(lift.htmlElement, requests.dequeue(), index);
    }
  } else {
    requests.dequeue();
  }
};

const openLift = (index) => {
  buttons.disabled = true;
  rightDoors[index].classList.add("right-door-open");
  leftDoors[index].classList.add("left-door-open");

  rightDoors[index].classList.remove("right-door-close");
  leftDoors[index].classList.remove("left-door-close");
};

const closeLift = (index) => {
  rightDoors[index].classList.add("right-door-close");
  leftDoors[index].classList.add("left-door-close");

  rightDoors[index].classList.remove("right-door-open");
  leftDoors[index].classList.remove("left-door-open");
  buttons.disabled = false;

  setTimeout(() => {
    lifts[index].busy = false;
    dispatchliftIdle();
  }, 2500);
};

const openCloseLift = (index) => {
  openLift(index);
  setTimeout(() => {
    closeLift(index);
  }, 3000);
};

const moveLift = (lift, destFloor, index) => {
  const distance = Math.abs(destFloor - lifts[index].currentFloor);
  lift.style.transform = `translateY(${destFloor * 100 * -1}%)`;
  lift.style.transition = `transform ${1500 * distance}ms ease-in-out`;

  setTimeout(() => {
    openCloseLift(index);
  }, distance * 1500 + 1000);

  lifts[index].currentFloor = destFloor;
};

function addRequest(destFloor) {
  requests.enqueue(destFloor);
  dispatchRequestAdded();
}

const requestAddedEvent = new Event("requestAdded");
const liftIdleEvent = new Event("liftIdle");

function dispatchRequestAdded() {
  document.dispatchEvent(requestAddedEvent);
}

function dispatchliftIdle() {
  document.dispatchEvent(liftIdleEvent);
}

document.addEventListener("requestAdded", () => {
  callLift();
});

document.addEventListener("liftIdle", () => {
  if (!requests.isEmpty()) {
    callLift();
  }
});

function addLift() {
  floors[floors.length - 1].append(getLiftEl());
  liftEls = document.querySelectorAll(".lift-container");
  lifts.push({
    htmlElement: liftEls[liftEls.length - 1],
    busy: false,
    currentFloor: 0,
  });
  leftDoors = document.querySelectorAll(".left-door");
  rightDoors = document.querySelectorAll(".right-door");
}

function getLiftEl() {
  const liftDistance = (lifts.length + 1) * 120;

  const liftEL = document.createElement("div");
  liftEL.classList.add("lift-container");
  liftEL.style.position = "absolute";
  liftEL.style.left = `${liftDistance}px`;

  liftEL.innerHTML += `
            <div class="left-door">
            </div>
            <div class="right-door">
            </div>
        `;

  return liftEL;
}

function addFloor() {
  floorsContainer.prepend(getFloorEl());
  floors = document.querySelectorAll(".floor");
  buttons = document.querySelectorAll(".call-lift-btn");
  addCallLiftListeners([buttons[0], buttons[1]]);
}

function getFloorEl() {
  const newLiftNum = floors.length;

  const floorEl = document.createElement("div");
  floorEl.classList.add("floor");
  floorEl.innerHTML += `
  <div class="lift-buttons">
    <button class="call-lift-btn open-lift-btn" data-lift-num="${newLiftNum}"><i
    class="fa fa-angle-double-up"
    style="font-size: 35px; color: rgb(255, 255, 255)"
  ></i></button>
    <button class="call-lift-btn close-lift-btn" data-lift-num="${newLiftNum}"><i
    class="fa fa-angle-double-down"
    style="font-size: 35px; color: rgb(255, 255, 255)"
  ></i></button>
  </div>
  `;
  return floorEl;
}

function addCallLiftListeners(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", () => {
      addRequest(buttons[i].dataset.liftNum);
    });
  }
}

let requests = new Queue();

function main() {
  addCallLiftListeners(buttons);
  floorButton.addEventListener("click", addFloor);
  liftButton.addEventListener("click", addLift);
}

main();