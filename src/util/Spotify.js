const accessToken;
const clientId = 'a0b77a1db8474ca689b4d70828fb3a15';
const redirectUri = 'http://localhost:3000/';

const Spotify = {
    getAccessToken() {
        if (accessToken){
            return accessToken;
        }
        //check for access token match

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        
        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);

            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        }else{
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }


    
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch("https://api.spotify.com/v1/search?type=track&q="+term,
        {
            headers: {
                'Authrization': `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(jsonResponse => {
            if (!jsonResponse.tracks){
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artist[0].name,
                album: track.album.name,
                uri: track.uri
            }) );
        } )
    },

    savePlayList(name, uri){
        if(!name || !uri){
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { 'Authorization': `Beare ${accessToken}`};
        let userId;

        return fetch('http://api.spotify.com/v`/me', {headers : headers}).then(response => response.json()).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,{
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: name}).then(response => response.json()).then(jsonResponse =>{
                    const playlistId= jsonResponse.id;
                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                        headers: headers,
                        method: 'POST',
                        body: JSON.stringify({uris: uri})
                    })
                })
            })
        })
    }


};

export default Spotify;
