const API = `https://media2.edu.metropolia.fi/restaurant/api/v1`

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}


async function getRestaurants() {
    try {
        const response = await fetch(`${API}/restaurants`,
            {method: 'GET'},
            {headers}
        )
        return await response.json();
    } catch (e) {
        console.log(`Error -> ${e}`);
    }
}



export {getRestaurants}