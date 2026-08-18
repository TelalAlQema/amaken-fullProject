// push.js
document.addEventListener('deviceready', function() {
    window.FirebasePlugin.getToken(function(token){
        fetch('https://yourdomain.com/server/save_token.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ token: token, user_id: 123 })
        });
    });

    window.FirebasePlugin.onMessageReceived(function(notification){
        alert(notification.title + "\n" + notification.body);
    });
}, false);
