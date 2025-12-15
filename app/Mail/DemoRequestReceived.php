<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DemoRequestReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function build()
    {
        return $this->subject('We received your demo request')
            ->view('emails.demo.received');
    }
}
