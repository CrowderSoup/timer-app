// Stopwatch class
class Stopwatch {
    constructor(id, label = "Stopwatch") {
        this.id = id;
        this.label = label;
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.interval = null;
        this.editingLabel = false;

        // DOM elements will be accessed via render method
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.interval = setInterval(() => this.update(), 10);
        this.updateButtons();
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.elapsedTime = Date.now() - this.startTime;
        clearInterval(this.interval);
        this.updateButtons();
    }

    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.display.textContent = '00:00:00.00';
        this.updateButtons();
    }

    update() {
        const elapsedTime = this.isRunning ? (Date.now() - this.startTime) : this.elapsedTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);

        this.display.textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }

    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
    }

    updateLabel(newLabel) {
        this.label = newLabel;
        const labelElement = document.getElementById(`stopwatch-label-${this.id}`);
        if (labelElement) {
            labelElement.textContent = newLabel;
        }
    }

    toggleLabelEdit() {
        this.editingLabel = !this.editingLabel;
        const labelContainer = document.getElementById(`stopwatch-label-container-${this.id}`);

        if (this.editingLabel) {
            labelContainer.innerHTML = `
                <button class="save-label-btn" id="save-stopwatch-label-btn-${this.id}">💾</button>
                <input type="text" id="stopwatch-label-input-${this.id}" class="timer-label-input" value="${this.label}">
            `;

            document.getElementById(`save-stopwatch-label-btn-${this.id}`).addEventListener('click', () => {
                const newLabel = document.getElementById(`stopwatch-label-input-${this.id}`).value.trim();
                if (newLabel) {
                    this.updateLabel(newLabel);
                }
                this.toggleLabelEdit();
            });
        } else {
            labelContainer.innerHTML = `
                <button class="edit-label-btn" id="edit-stopwatch-label-btn-${this.id}">✏️</button>
                <div class="timer-label" id="stopwatch-label-${this.id}">${this.label}</div>
            `;

            document.getElementById(`edit-stopwatch-label-btn-${this.id}`).addEventListener('click', () => {
                this.toggleLabelEdit();
            });
        }
    }

    toJSON() {
        return {
            id: this.id,
            label: this.label,
            elapsedTime: this.elapsedTime,
            isRunning: this.isRunning,
            startTime: this.startTime
        };
    }
}

// Timer class to handle individual timer functionality
class Timer {
  constructor(id, label = "Timer", hours = 0, minutes = 5, seconds = 0) {
    this.id = id;
    this.label = label;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
    this.initialSeconds = this.totalSeconds;
    this.isRunning = false;
    this.interval = null;
    this.completed = false;
    this.editingLabel = false;
  }

  start() {
    if (this.isRunning || this.totalSeconds <= 0) return;

    this.isRunning = true;
    this.interval = setInterval(() => {
      this.totalSeconds--;

      if (this.totalSeconds <= 0) {
        this.stop();
        this.completed = true;
        document.getElementById(`alarm-${this.id}`).play().catch(e => console.error("Error playing sound:", e));
        document.getElementById(`timer-card-${this.id}`).classList.add('completed');
      }

      this.updateDisplay();
    }, 1000);

    // Update button states
    const startBtn = document.getElementById(`start-btn-${this.id}`);
    const stopBtn = document.getElementById(`stop-btn-${this.id}`);

    if (startBtn && stopBtn) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
    }

    // Disable input fields
    const hoursInput = document.getElementById(`hours-${this.id}`);
    const minutesInput = document.getElementById(`minutes-${this.id}`);
    const secondsInput = document.getElementById(`seconds-${this.id}`);

    if (hoursInput && minutesInput && secondsInput) {
      hoursInput.disabled = true;
      minutesInput.disabled = true;
      secondsInput.disabled = true;
    }
  }

  stop() {
    if (!this.isRunning) return;

    clearInterval(this.interval);
    this.isRunning = false;

    // Update button states
    const startBtn = document.getElementById(`start-btn-${this.id}`);
    const stopBtn = document.getElementById(`stop-btn-${this.id}`);

    if (startBtn && stopBtn) {
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    // Enable input fields
    const hoursInput = document.getElementById(`hours-${this.id}`);
    const minutesInput = document.getElementById(`minutes-${this.id}`);
    const secondsInput = document.getElementById(`seconds-${this.id}`);

    if (hoursInput && minutesInput && secondsInput) {
      hoursInput.disabled = false;
      minutesInput.disabled = false;
      secondsInput.disabled = false;
    }
  }

  reset() {
    this.stop();
    this.totalSeconds = this.hours * 3600 + this.minutes * 60 + this.seconds;
    this.completed = false;
    document.getElementById(`timer-card-${this.id}`).classList.remove('completed');
    this.updateDisplay();
  }

  updateDisplay() {
    const display = document.getElementById(`timer-display-${this.id}`);
    if (display) {
      display.textContent = this.formatTime();
    }

    // Update buttons state
    const startBtn = document.getElementById(`start-btn-${this.id}`);
    const stopBtn = document.getElementById(`stop-btn-${this.id}`);

    if (startBtn && stopBtn) {
      startBtn.disabled = this.isRunning || this.totalSeconds <= 0;
      stopBtn.disabled = !this.isRunning;
    }

    // Update input fields
    const hoursInput = document.getElementById(`hours-${this.id}`);
    const minutesInput = document.getElementById(`minutes-${this.id}`);
    const secondsInput = document.getElementById(`seconds-${this.id}`);

    if (hoursInput && minutesInput && secondsInput) {
      hoursInput.disabled = this.isRunning;
      minutesInput.disabled = this.isRunning;
      secondsInput.disabled = this.isRunning;
    }
  }

  updateFromInputs() {
    if (this.isRunning) return;

    const hoursInput = document.getElementById(`hours-${this.id}`);
    const minutesInput = document.getElementById(`minutes-${this.id}`);
    const secondsInput = document.getElementById(`seconds-${this.id}`);

    this.hours = parseInt(hoursInput.value) || 0;
    this.minutes = parseInt(minutesInput.value) || 0;
    this.seconds = parseInt(secondsInput.value) || 0;

    this.totalSeconds = this.hours * 3600 + this.minutes * 60 + this.seconds;
    this.initialSeconds = this.totalSeconds;
    this.completed = false;
    document.getElementById(`timer-card-${this.id}`).classList.remove('completed');

    this.updateDisplay();
  }

  formatTime() {
    const hours = Math.floor(this.totalSeconds / 3600);
    const minutes = Math.floor((this.totalSeconds % 3600) / 60);
    const seconds = this.totalSeconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    if (hours > 0) {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  }

  updateLabel(newLabel) {
    this.label = newLabel;
    const labelElement = document.getElementById(`timer-label-${this.id}`);
    if (labelElement) {
      labelElement.textContent = newLabel;
    }
  }

  toggleLabelEdit() {
    this.editingLabel = !this.editingLabel;
    const labelContainer = document.getElementById(`label-container-${this.id}`);

    if (this.editingLabel) {
      labelContainer.innerHTML = `
                        <button class="save-label-btn" id="save-label-btn-${this.id}">💾</button>
                        <input type="text" id="label-input-${this.id}" class="timer-label-input" value="${this.label}">
                    `;

      document.getElementById(`save-label-btn-${this.id}`).addEventListener('click', () => {
        const newLabel = document.getElementById(`label-input-${this.id}`).value.trim();
        if (newLabel) {
          this.updateLabel(newLabel);
        }
        this.toggleLabelEdit();
      });
    } else {
      labelContainer.innerHTML = `
                        <button class="edit-label-btn" id="edit-label-btn-${this.id}">✏️</button>
                        <div class="timer-label" id="timer-label-${this.id}">${this.label}</div>
                    `;

      document.getElementById(`edit-label-btn-${this.id}`).addEventListener('click', () => {
        this.toggleLabelEdit();
      });
    }
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      totalSeconds: this.totalSeconds,
      initialSeconds: this.initialSeconds,
      isRunning: this.isRunning, // Save the running state
      completed: this.completed,
      lastSaved: new Date().getTime() // Save timestamp when timer state was saved
    };
  }
}

// TimerManager class to handle multiple timers
class TimerManager {
  constructor() {
    this.timers = [];
    this.nextId = 1;
    this.loadFromLocalStorage();

    // Add event listener for add timer button
    document.getElementById('addTimerBtn').addEventListener('click', () => {
      this.addTimer();
    });

    // Add event listener for beforeunload to save timers
    window.addEventListener('beforeunload', () => {
      this.saveToLocalStorage();
    });
  }

  addTimer(label = `Timer ${this.nextId}`, hours = 0, minutes = 5, seconds = 0, totalSeconds = null, completed = false) {
    const id = this.nextId++;
    const timer = new Timer(id, label, hours, minutes, seconds);

    // Set totalSeconds if provided (for restoring timers)
    if (totalSeconds !== null) {
      timer.totalSeconds = totalSeconds;
    }

    timer.completed = completed;

    this.timers.push(timer);
    this.renderTimer(timer);
    this.saveToLocalStorage();

    return timer;
  }

  deleteTimer(id) {
    const index = this.timers.findIndex(timer => timer.id === id);
    if (index !== -1) {
      const timer = this.timers[index];
      timer.stop();
      this.timers.splice(index, 1);

      const timerElement = document.getElementById(`timer-card-${id}`);
      if (timerElement) {
        timerElement.remove();
      }

      this.saveToLocalStorage();
    }
  }

  renderTimer(timer) {
    const timersContainer = document.getElementById('timers-container');

    // Create timer card
    const timerCard = document.createElement('div');
    timerCard.id = `timer-card-${timer.id}`;
    timerCard.className = `timer-card ${timer.completed ? 'completed' : ''}`;

    // Create timer content
    timerCard.innerHTML = `
                    <div class="timer-header">
                        <div id="label-container-${timer.id}" style="display: flex; align-items: center;">
                            <button class="edit-label-btn" id="edit-label-btn-${timer.id}">✏️</button>
                            <div class="timer-label" id="timer-label-${timer.id}">${timer.label}</div>
                        </div>
                        <button class="btn-delete" id="delete-btn-${timer.id}">✕</button>
                    </div>
                    
                    <div class="time-inputs">
                        <div class="time-input">
                            <label for="hours-${timer.id}">Hours</label>
                            <input type="number" id="hours-${timer.id}" min="0" max="23" value="${timer.hours}" ${timer.isRunning ? 'disabled' : ''}>
                        </div>
                        <div class="time-input">
                            <label for="minutes-${timer.id}">Minutes</label>
                            <input type="number" id="minutes-${timer.id}" min="0" max="59" value="${timer.minutes}" ${timer.isRunning ? 'disabled' : ''}>
                        </div>
                        <div class="time-input">
                            <label for="seconds-${timer.id}">Seconds</label>
                            <input type="number" id="seconds-${timer.id}" min="0" max="59" value="${timer.seconds}" ${timer.isRunning ? 'disabled' : ''}>
                        </div>
                    </div>
                    
                    <div class="timer-display" id="timer-display-${timer.id}">${timer.formatTime()}</div>
                    
                    <div class="button-group">
                        <button class="btn-start" id="start-btn-${timer.id}" ${timer.isRunning ? 'disabled' : ''}>Start</button>
                        <button class="btn-stop" id="stop-btn-${timer.id}" ${!timer.isRunning ? 'disabled' : ''}>Stop</button>
                        <button class="btn-reset" id="reset-btn-${timer.id}">Reset</button>
                    </div>
                    
                    <audio id="alarm-${timer.id}" src="https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3" preload="auto"></audio>
                `;

    // Append timer card to container
    timersContainer.appendChild(timerCard);

    // Add event listeners for timer controls
    document.getElementById(`start-btn-${timer.id}`).addEventListener('click', () => {
      timer.start();
      this.saveToLocalStorage();
    });

    document.getElementById(`stop-btn-${timer.id}`).addEventListener('click', () => {
      timer.stop();
      this.saveToLocalStorage();
    });

    document.getElementById(`reset-btn-${timer.id}`).addEventListener('click', () => {
      timer.reset();
      this.saveToLocalStorage();
    });

    document.getElementById(`delete-btn-${timer.id}`).addEventListener('click', () => {
      this.deleteTimer(timer.id);
    });

    document.getElementById(`edit-label-btn-${timer.id}`).addEventListener('click', () => {
      timer.toggleLabelEdit();
    });

    // Add event listeners for inputs
    const inputIds = [`hours-${timer.id}`, `minutes-${timer.id}`, `seconds-${timer.id}`];
    inputIds.forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        timer.updateFromInputs();
        this.saveToLocalStorage();
      });
    });

    // Set initial state
    timer.updateDisplay();
  }

  renderAllTimers() {
    const timersContainer = document.getElementById('timers-container');
    timersContainer.innerHTML = '';

    this.timers.forEach(timer => {
      this.renderTimer(timer);
    });
  }

  saveToLocalStorage() {
    const timersData = this.timers.map(timer => timer.toJSON());
    localStorage.setItem('timers', JSON.stringify(timersData));
    localStorage.setItem('nextId', this.nextId.toString());
  }

  loadFromLocalStorage() {
    try {
      const timersData = localStorage.getItem('timers');
      const nextIdStr = localStorage.getItem('nextId');

      if (timersData) {
        const parsedData = JSON.parse(timersData);

        if (Array.isArray(parsedData)) {
          parsedData.forEach(data => {
            // Calculate elapsed time since last save
            let currentTotalSeconds = data.totalSeconds;
            let wasRunning = data.isRunning;

            // If there was a lastSaved timestamp and the timer was running
            if (data.lastSaved && data.isRunning && !data.completed) {
              const now = new Date().getTime();
              const elapsedSeconds = Math.floor((now - data.lastSaved) / 1000);

              // Subtract elapsed time, but don't go below 0
              currentTotalSeconds = Math.max(0, data.totalSeconds - elapsedSeconds);

              // Mark as completed if timer reached 0
              if (currentTotalSeconds === 0) {
                data.completed = true;
                wasRunning = false;
              }
            }

            const timer = this.addTimer(
              data.label,
              data.hours,
              data.minutes,
              data.seconds,
              currentTotalSeconds,
              data.completed
            );

            // If the timer was running and hasn't completed, restart it
            if (wasRunning && !data.completed && currentTotalSeconds > 0) {
              setTimeout(() => {
                timer.start();
              }, 100); // Small delay to ensure DOM is ready
            }
          });
        }
      }

      if (nextIdStr) {
        const parsedNextId = parseInt(nextIdStr);
        if (!isNaN(parsedNextId)) {
          this.nextId = parsedNextId;
        }
      }

      // If no timers were loaded, add a default one
      if (this.timers.length === 0) {
        this.addTimer();
      }
    } catch (error) {
      console.error('Error loading timers from localStorage:', error);
      // Add a default timer if loading failed
      this.addTimer();
    }
  }
}

// StopwatchManager class to handle multiple stopwatches
class StopwatchManager {
    constructor() {
        this.stopwatches = [];
        this.nextId = 1;
        this.loadFromLocalStorage();

        document.getElementById('addStopwatchBtn').addEventListener('click', () => {
            this.addStopwatch();
        });

        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    }

    addStopwatch(label, elapsedTime = 0, isRunning, startTime) {
        const id = this.nextId++;
        const stopwatch = new Stopwatch(id, label || `Stopwatch ${id}`);
        
        if (elapsedTime) {
            stopwatch.elapsedTime = elapsedTime;
        }
        
        if (isRunning) {
            stopwatch.isRunning = isRunning;
            stopwatch.startTime = startTime;
        }

        this.stopwatches.push(stopwatch);
        this.renderStopwatch(stopwatch);
        this.saveToLocalStorage();
        
        if (stopwatch.isRunning) {
            stopwatch.start();
        }

        return stopwatch;
    }

    deleteStopwatch(id) {
        const index = this.stopwatches.findIndex(sw => sw.id === id);
        if (index !== -1) {
            this.stopwatches[index].stop();
            this.stopwatches.splice(index, 1);
            const stopwatchElement = document.getElementById(`stopwatch-card-${id}`);
            if (stopwatchElement) {
                stopwatchElement.remove();
            }
            this.saveToLocalStorage();
        }
    }

    renderStopwatch(stopwatch) {
        const container = document.getElementById('stopwatches-container');
        const card = document.createElement('div');
        card.id = `stopwatch-card-${stopwatch.id}`;
        card.className = 'timer-card'; // Reuse timer-card styles

        card.innerHTML = `
            <div class="timer-header">
                <div id="stopwatch-label-container-${stopwatch.id}" style="display: flex; align-items: center;">
                    <button class="edit-label-btn" id="edit-stopwatch-label-btn-${stopwatch.id}">✏️</button>
                    <div class="timer-label" id="stopwatch-label-${stopwatch.id}">${stopwatch.label}</div>
                </div>
                <button class="btn-delete" id="delete-stopwatch-btn-${stopwatch.id}">✕</button>
            </div>
            <div class="timer-display" id="stopwatch-display-${stopwatch.id}">00:00:00.00</div>
            <div class="button-group">
                <button class="btn-start" id="stopwatch-start-btn-${stopwatch.id}">Start</button>
                <button class="btn-stop" id="stopwatch-stop-btn-${stopwatch.id}" disabled>Stop</button>
                <button class="btn-reset" id="stopwatch-reset-btn-${stopwatch.id}">Reset</button>
            </div>
        `;

        container.appendChild(card);

        stopwatch.display = document.getElementById(`stopwatch-display-${stopwatch.id}`);
        stopwatch.startBtn = document.getElementById(`stopwatch-start-btn-${stopwatch.id}`);
        stopwatch.stopBtn = document.getElementById(`stopwatch-stop-btn-${stopwatch.id}`);
        stopwatch.resetBtn = document.getElementById(`stopwatch-reset-btn-${stopwatch.id}`);

        stopwatch.startBtn.addEventListener('click', () => stopwatch.start());
        stopwatch.stopBtn.addEventListener('click', () => stopwatch.stop());
        stopwatch.resetBtn.addEventListener('click', () => stopwatch.reset());
        document.getElementById(`delete-stopwatch-btn-${stopwatch.id}`).addEventListener('click', () => this.deleteStopwatch(stopwatch.id));
        document.getElementById(`edit-stopwatch-label-btn-${stopwatch.id}`).addEventListener('click', () => stopwatch.toggleLabelEdit());
        
        stopwatch.update();
        stopwatch.updateButtons();
    }

    saveToLocalStorage() {
        const stopwatchesData = this.stopwatches.map(sw => sw.toJSON());
        localStorage.setItem('stopwatches', JSON.stringify(stopwatchesData));
        localStorage.setItem('nextStopwatchId', this.nextId.toString());
    }

    loadFromLocalStorage() {
        try {
            const stopwatchesData = localStorage.getItem('stopwatches');
            const nextIdStr = localStorage.getItem('nextStopwatchId');

            if (stopwatchesData) {
                const parsedData = JSON.parse(stopwatchesData);
                if (Array.isArray(parsedData)) {
                    parsedData.forEach(data => {
                        this.addStopwatch(data.label, data.elapsedTime, data.isRunning, data.startTime);
                    });
                }
            }

            if (nextIdStr) {
                this.nextId = parseInt(nextIdStr, 10);
            }

            if (this.stopwatches.length === 0) {
                this.addStopwatch();
            }
        } catch (error) {
            console.error('Error loading stopwatches from localStorage:', error);
            this.addStopwatch();
        }
    }
}

// Initialize the timer manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.timerAppManager = new TimerManager();
  window.stopwatchManager = new StopwatchManager();

  // Set up periodic save to ensure timer states are saved regularly
  setInterval(() => {
    if (window.timerAppManager) {
      window.timerAppManager.saveToLocalStorage();
    }
    if (window.stopwatchManager) {
        window.stopwatchManager.saveToLocalStorage();
    }
  }, 5000); // Save every 5 seconds

  const savedTab = localStorage.getItem('activeTab');
  if (savedTab) {
    openTab(null, savedTab);
  } else {
    // If no tab is saved, open the first tab by default
    openTab(null, 'timers');
  }
});

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tab-link");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";

  // Find the button that corresponds to the tabName and add 'active' class
  for (i = 0; i < tablinks.length; i++) {
    if (tablinks[i].getAttribute('onclick').includes(`'${tabName}'`)) {
      tablinks[i].className += " active";
      break;
    }
  }

  if (evt) {
    evt.currentTarget.className += " active";
  }
  
  localStorage.setItem('activeTab', tabName);
}
