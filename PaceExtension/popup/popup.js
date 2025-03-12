const settingsButton = document.getElementById('settings');

settingsButton.addEventListener('click', function() {
    if (settingsButton.innerHTML === '<i class="fa fa-cog"></i>') {
        settingsButton.innerHTML = '<i class="fa fa-times"></i>';
        changeUI();
    } else {
        settingsButton.innerHTML = '<i class="fa fa-cog"></i>';
        document.getElementById('container').innerHTML = `<div id="data">Loading...</div>`;  
    }
});

function changeUI() {
    document.getElementById('container').innerHTML = `
        <div id="containerInner">
        <div>
            <input type="checkbox" id="whitelistOn">
            <label for="whitelistOn">Enable Whitelist</label>
        </div>
        <div>
            <input type="text" id="runnerInput" placeholder="Enter name">
            <button id="addRunner">Add</button>
        </div>
            <h1>Whitelisted runners:</h1>
            <p id="runnerList"></p>
        </div>
    `;  

    addRunnerFromMemory();
    

    // Add event listeners *after* inserting the new elements
    document.getElementById("addRunner").addEventListener("click", addRunner);
    document.getElementById("runnerInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            addRunner();
        }
    });
}

function addRunner() {
    const input = document.getElementById("runnerInput");
    const name = input.value.trim();
    if (name) {
        const runnerList = document.getElementById("runnerList");

        // ✅ Create <a> tag dynamically
        const runnerLink = document.createElement("a");
        runnerLink.classList.add("runner-name");
        runnerLink.textContent = name + " ";
        runnerLink.href = "#"; // Prevent page jump

        // ✅ Attach event listener instead of inline `onclick`
        runnerLink.addEventListener("click", function () {
            console.log("Click");
            removeRunner(name);
            console.log("Runner removed:", name);
        });

        runnerList.appendChild(runnerLink); // Append to list
        input.value = "";

        // ✅ Store names in Chrome storage
        chrome.storage.local.get("runners", function (result) {
            const runners = result.runners || [];
            runners.push(name);
            chrome.storage.local.set({ runners }, function () {
                console.log("Runners saved:", runners);
            });
        });
    }
}

function addRunnerFromMemory() {
    chrome.storage.local.get("runners", function(result) {
        console.log(result);
        const runners = result.runners || []; // ✅ Default to empty array if undefined
        const runnerList = document.getElementById("runnerList");

        // Clear existing list to prevent duplicates
        runnerList.innerHTML = "";

        runners.forEach(name => {
            // ✅ Create <a> tag dynamically
            const runnerLink = document.createElement("a");
            runnerLink.classList.add("runner-name");
            runnerLink.textContent = name + " ";
            runnerLink.href = "#"; // Prevent page jump

            // ✅ Attach event listener instead of inline `onclick`
            runnerLink.addEventListener("click", function () {
                removeRunner(name);
            });

            runnerList.appendChild(runnerLink); // Append to list
        });
    });
}

function removeRunner(name) {
    console.log(name);
    const runners = document.getElementById("runnerList");
    const runnerLinks = runners.getElementsByTagName("a"); // Get all <a> elements inside the runner list

    // Loop through all the <a> elements to find the one with the matching name
    for (let i = 0; i < runnerLinks.length; i++) {
        const runnerLink = runnerLinks[i];
        if (runnerLink.textContent.trim() === name) {
            runnerLink.remove(); // Remove the matching element from the DOM
            break; // Stop the loop after removing the element
        }
    }

    // Now update Chrome storage by removing the runner name
    chrome.storage.local.get("runners", function(result) {
        const runners = result.runners || []; // Default to empty array if undefined
        const newRunners = runners.filter(runner => runner !== name);
        chrome.storage.local.set({ runners: newRunners });
    });
}
