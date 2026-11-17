<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HW Catering - Broadcast Tool</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Broadcast Manager</h1>
        
        <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p class="text-sm text-yellow-700">
                Ensure you have the Admin Bearer Token to use this tool.
            </p>
        </div>

        <form id="broadcastForm" class="space-y-4">
            <!-- Token Input -->
            <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="token">
                    Bearer Token (Admin)
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="token" type="password" placeholder="Paste your Bearer Token here..." required>
            </div>

            <!-- Target Selection -->
            <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                    Target
                </label>
                <div class="flex items-center mb-2">
                    <input type="radio" id="all" name="target" value="all" class="mr-2" checked onchange="toggleTargetInput()">
                    <label for="all" class="mr-4 text-gray-700">All Customers</label>
                    
                    <input type="radio" id="specific" name="target" value="specific" class="mr-2" onchange="toggleTargetInput()">
                    <label for="specific" class="text-gray-700">Specific IDs</label>
                </div>
                
                <div id="targetInputDiv" class="hidden mt-2">
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        id="targetIds" type="text" placeholder="e.g. 1, 5, 8 (comma separated)">
                </div>
            </div>

            <!-- Message Input -->
            <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="message">
                    Message
                </label>
                <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32" 
                    id="message" placeholder="Type your broadcast message here..." required></textarea>
            </div>

            <!-- Submit Button -->
            <div class="flex items-center justify-between">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" 
                    type="submit" id="submitBtn">
                    Send Broadcast
                </button>
            </div>
        </form>

        <!-- Response Area -->
        <div id="responseArea" class="mt-6 hidden">
            <h3 class="font-bold text-gray-700 mb-2">Response:</h3>
            <pre id="responseContent" class="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm"></pre>
        </div>
    </div>

    <script>
        function toggleTargetInput() {
            const isSpecific = document.getElementById('specific').checked;
            const inputDiv = document.getElementById('targetInputDiv');
            if (isSpecific) {
                inputDiv.classList.remove('hidden');
            } else {
                inputDiv.classList.add('hidden');
            }
        }

        document.getElementById('broadcastForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const responseArea = document.getElementById('responseArea');
            const responseContent = document.getElementById('responseContent');
            const token = document.getElementById('token').value;
            const message = document.getElementById('message').value;
            const targetType = document.querySelector('input[name="target"]:checked').value;
            
            let data = {
                message: message
            };

            if (targetType === 'specific') {
                const ids = document.getElementById('targetIds').value;
                if (ids && ids.trim() !== '') {
                    data.target_pelanggan_ids = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                }
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            submitBtn.classList.add('opacity-50');
            responseArea.classList.add('hidden');

            try {
                const response = await fetch('/api/broadcast/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                responseContent.textContent = JSON.stringify(result, null, 2);
                responseArea.classList.remove('hidden');
                
                if (response.ok) {
                    responseContent.classList.remove('text-red-400');
                    responseContent.classList.add('text-green-400');
                } else {
                    responseContent.classList.remove('text-green-400');
                    responseContent.classList.add('text-red-400');
                }

            } catch (error) {
                responseContent.textContent = 'Error: ' + error.message;
                responseArea.classList.remove('hidden');
                responseContent.classList.remove('text-green-400');
                responseContent.classList.add('text-red-400');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Broadcast';
                submitBtn.classList.remove('opacity-50');
            }
        });
    </script>
</body>
</html>
