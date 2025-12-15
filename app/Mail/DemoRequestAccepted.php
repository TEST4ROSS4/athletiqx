<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DemoRequestAccepted extends Mailable
{
    use Queueable, SerializesModels;

    public string $email;
    public string $password;
    public string $loginUrl;

    public function __construct(string $email, string $password, string $loginUrl)
    {
        $this->email = $email;
        $this->password = $password;
        $this->loginUrl = $loginUrl;
    }

    public function build()
    {
        return $this->subject('Your AthletiQX demo access')
            ->view('emails.demo.accepted')
            ->with([
                'email' => $this->email,
                'password' => $this->password,
                'loginUrl' => $this->loginUrl,
            ]);
    }
}
