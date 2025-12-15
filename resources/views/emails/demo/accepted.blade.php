<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your AthletiQX demo access</title>
</head>
<body>
    <p>Hi,</p>
    <p>Your AthletiQX demo request has been approved. You can log in with the credentials below:</p>
    <ul>
        <li><strong>Email:</strong> {{ $email }}</li>
        <li><strong>Password:</strong> {{ $password }}</li>
    </ul>
    <p>Login: <a href="{{ $loginUrl }}">{{ $loginUrl }}</a></p>
    <p>Please change your password after signing in.</p>
    <p>— AthletiQX Team</p>
</body>
</html>
