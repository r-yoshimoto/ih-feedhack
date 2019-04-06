# Feedback

Feedback is platform where you send feedbacks not only to coworkers, but also to friends, family and business connections.


## Installation instructions

All files must be in the same folder.
Design won't load without a internet connection (Bootstrap front-end).
Necessary email service in order to send e-mails to users.
Necessary mongodb in order to store dta.


## How to use

First, you need to sign up in the platform. After confirming your account by e-mail, you can send your feedback.
You can send feedbacks to users which are not registered in the database. They can view the feedback using a token without registration.
There are a inbox, outbox and draft tabs similar to a e-mail account.
You can also invite your 

Each player alternately selects in which column want to add a piece, using button-clicks in the respective column.
When there are 4 connected pieces of the same color, this player wins the game. When nobody achieves it, there is a tie.
The keyboard can also be used to the play the game, in which each number corresponds to a column.

## Technologies and approach

First, the game was built using only a matrix, with basic Javascript and some CSS (start-game button), without user interface, using keyboard commands.
Second, a static user interface was devised using Canvas.
After, animated falling pieces were added using Javascript animation.
At last, click-buttons were added using CSS and Jquery.

## Unsolved problems/Future development

- Readen feedbacks unformatted.
- Delivered feedbacks without date marks.
- Not responsive design.
- Delete user account not implemented.
- New feedbacks counting all messages.
- Sent email unformatted.


