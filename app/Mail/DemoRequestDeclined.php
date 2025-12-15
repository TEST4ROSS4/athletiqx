<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DemoRequestDeclined extends Mailable
{
    use Queueable, SerializesModels;

    public function build()
    {
        return $this->subject('Update on your AthletiQX demo request')
            ->view('emails.demo.declined');
    }
}
