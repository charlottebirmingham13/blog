# Notes in two scripts

Some thoughts arrive in English, others in Persian, and a few stubbornly refuse to
translate. This blog treats both as first-class.

## یک پاراگراف فارسی

این یک پاراگراف کوتاه به زبان فارسی است. مرورگر باید جهت متن را به‌صورت خودکار
از راست به چپ تنظیم کند، چون از ویژگی `dir="auto"` روی هر پاراگراف استفاده شده است.
علامت‌های نگارشی، اعداد ۱۲۳، و واژه‌های انگلیسی مثل *markdown* در همین خط هم
درست نمایش داده می‌شوند.

## A mixed paragraph

Sometimes a sentence wants to start in English and end with یک عبارت فارسی in the
middle. The browser's bidirectional algorithm handles the inline runs; the
paragraph as a whole takes whichever direction its first strong character implies.

## فهرست کوتاه

- نکته‌ی اول
- نکته‌ی دوم با یک کلمه‌ی English
- نکته‌ی سوم

## A short list in English

- One
- Two with یک کلمه‌ی فارسی
- Three

That's the whole trick: `dir="auto"` on each block element, and let the browser do
its job.
