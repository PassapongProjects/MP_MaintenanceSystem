export async function fetchObjects(funcArr = null) {
    if (funcArr == null) {
        return false;
    }

    try {
        const response = await $.ajax({
            type: 'POST',
            url: 'fetch_global_ppss.php',
            data: { "functions": funcArr }
        });

        const parsedResponse = JSON.parse(response);

        if (parsedResponse.status) {
            return parsedResponse;
        } else {
            return false;
        }
    } catch (error) {
        throw error;
    }
}