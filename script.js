function calculate() {
    const ipAddress = document.getElementById("ipAddress").value;
    const subnetMask = document.getElementById("subnetMask").value;
    const resultDiv = document.getElementById("result");
    const errorDiv = document.getElementById("error");

    // Reset error and result messages
    resultDiv.innerHTML = "";
    errorDiv.innerHTML = "";

    try {
        // Validate IP address input
        if (!isValidIpAddress(ipAddress)) {
            throw new Error("Invalid IP address format");
        }

        // Validate subnet mask input
        if (!isValidSubnetMask(subnetMask)) {
            throw new Error("Invalid subnet mask format");
        }

        // Split the IP address and subnet mask into octets
        const ipAddressOctets = ipAddress.split(".");
        const subnetMaskOctets = subnetMask.split(".");

        // Initialize variables for network address and CIDR notation
        let networkAddress = "";
        let cidrNotation = 0;

        // Calculate network address
        for (let i = 0; i < 4; i++) {
            const ipOctet = parseInt(ipAddressOctets[i], 10);
            const maskOctet = parseInt(subnetMaskOctets[i], 10);

            if (maskOctet > 255 || maskOctet < 0) {
                throw new Error("Subnet mask octets must be in the range 0-255");
            }

            // Calculate the network address
            networkAddress += (ipOctet & maskOctet).toString();
            if (i < 3) networkAddress += ".";
        }

        // Calculate CIDR notation
        let maskBinary = "";
        for (let i = 0; i < 4; i++) {
            const maskOctet = parseInt(subnetMaskOctets[i], 10);
            maskBinary += maskOctet.toString(2).padStart(8, "0");
        }
        cidrNotation = maskBinary.replace(/0/g, "").length;

        // Calculate usable hosts
        const usableHosts = Math.pow(2, 32 - cidrNotation) - 2;

        // Display the results
        resultDiv.innerHTML = `Network Address: ${networkAddress}, CIDR Block: /${cidrNotation}, Usable Hosts: ${usableHosts}`;
    } catch (error) {
        errorDiv.innerHTML = "Error: " + error.message;
    }
}

function calculateIpRange() {
    const ipWithCidr = document.getElementById("ipWithCidr").value;
    const ipResultDiv = document.getElementById("ipResult");

    // Reset result messages
    ipResultDiv.innerHTML = "";

    try {
        // Validate CIDR notation
        if (!isValidIpWithCidr(ipWithCidr)) {
            throw new Error("Invalid IP address with CIDR format");
        }

        // Extract the IP and CIDR parts
        const [ip, cidr] = ipWithCidr.split("/");

        // Calculate the IP range
        const ipRangeStart = ip;
        const ipRangeEnd = calculateIpRangeEnd(ip, cidr);

        // Calculate the number of IP addresses in the range
        const ipsInRange = calculateIpsInRange(ip, cidr);

        // Calculate mask bits and subnet mask
        const maskBits = cidr;
        const subnetMask = calculateSubnetMask(cidr);

        // Display the results in the specified format
        ipResultDiv.innerHTML = `
            <p><strong>Input:</strong><br> ${ipWithCidr}</p>
            <p><strong>CIDR:</strong><br> ${ip}/${cidr}</p>
            <p><strong>Input IP:</strong><br> ${ip}</p>
            <p><strong>CIDR IP Range:</strong><br> ${ipRangeStart} - ${ipRangeEnd}</p>
            <p><strong>IPs in Range:</strong><br> ${ipsInRange}</p>
            <p><strong>Mask Bits:</strong><br> ${maskBits}</p>
            <p><strong>Subnet Mask:</strong><br> ${subnetMask}</p>
        `;
    } catch (error) {
        ipResultDiv.innerHTML = "Error: " + error.message;
    }
}

function calculateIpRangeEnd(ip, cidr) {
    // Calculate the ending IP address in the range
    const ipNumeric = ip.split('.').map(Number);
    const hostBits = 32 - cidr;
    const ipEndNumeric = ipNumeric.map((octet, index) => {
        if (index < Math.floor(cidr / 8)) {
            return octet;
        } else if (index === Math.floor(cidr / 8)) {
            return octet + Math.pow(2, 8 - (cidr % 8)) - 1;
        } else {
            return index < 3 ? 255 : 254 + (Math.pow(2, hostBits) - 2);
        }
    });
    return ipEndNumeric.join('.');
}

function calculateIpsInRange(ip, cidr) {
    // Calculate the number of IP addresses in the range
    return Math.pow(2, 32 - cidr);
}

function calculateSubnetMask(cidr) {
    // Calculate the subnet mask
    const subnetMask = Array(4).fill(0);
    for (let i = 0; i < 4; i++) {
        if (cidr >= 8) {
            subnetMask[i] = 255;
            cidr -= 8;
        } else {
            subnetMask[i] = 256 - Math.pow(2, 8 - cidr);
            cidr = 0;
        }
    }
    return subnetMask.join('.');
}

function isValidIpAddress(ip) {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

function isValidSubnetMask(mask) {
    const maskRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return maskRegex.test(mask);
}

function isValidIpWithCidr(ipWithCidr) {
    const ipWithCidrRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[12]?[0-9]|0?[1-9])$/;
    return ipWithCidrRegex.test(ipWithCidr);
}

// Add event listeners for the buttons
document.getElementById("calculateButton").addEventListener("click", calculate);
document.getElementById("calculateIpRangeButton").addEventListener("click", calculateIpRange);

// Function to calculate when Enter key is pressed in the input fields
document.getElementById("ipAddress").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        calculate();
    }
});

document.getElementById("subnetMask").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        calculate();
    }
});

document.getElementById("ipWithCidr").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        calculateIpRange();
    }
});

/*

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
}


// Check local storage for mode preference
const savedMode = localStorage.getItem('mode');
if (savedMode === 'dark') {
    document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Store mode preference in local storage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('mode', 'dark');
    } else {
        localStorage.setItem('mode', 'light');
    }
}

*/
