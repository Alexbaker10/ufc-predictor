document.getElementById('predictBtn').addEventListener('click', async () => {
    const fighter1 = document.getElementById('fighter1').value.trim();
    const fighter2 = document.getElementById('fighter2').value.trim();
    
    if (!fighter1 || !fighter2) {
        alert("Please enter both fighters.");
        return;
    }

    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');

    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fighter1, fighter2 })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // Populate Results
        document.getElementById('matchupTitle').innerText = data.matchup;
        document.getElementById('analysisText').innerText = data.analysis;

        // Odds Breakdown
        const oddsDiv = document.getElementById('oddsContainer');
        oddsDiv.innerHTML = `
            <div>${fighter1}: ${data.probabilities[fighter1]}%</div>
            <div>${fighter2}: ${data.probabilities[fighter2]}%</div>
        `;

        // Fav/Dog Breakdown
        const statsList = document.getElementById('statsList');
        statsList.innerHTML = '';
        for (const [category, edges] of Object.entries(data.stats)) {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${category.toUpperCase()}:</strong> 
                <span class="fav">Fav (-1): ${edges.fav}</span> | 
                <span class="dog">Dog (+1): ${edges.dog}</span>
            `;
            statsList.appendChild(li);
        }

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');

    } catch (error) {
        alert("An error occurred: " + error.message);
        document.getElementById('loading').classList.add('hidden');
    }
});