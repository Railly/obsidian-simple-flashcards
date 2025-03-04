<h3 align="center">
	<img src="logo.png" width="100" alt="Logo"/><br/>
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/misc/transparent.png" height="30" width="0px"/>
	Simple Flashcards for <a href="https://obsidian.md/">Obsidian</a>
</h3>

<p align="center">
Display interactive flashcards to formulate knowledge 🧠
  <br>
</p>

## Features

🗃️ Standard Q&A flashcards  
🎴 Cloze deletion flashcards for active recall  
🔁 Customizable reveal methods (hover, button click, surface click)  
🖋️ Inline cloze deletion with `{{word}}` syntax  
🧠 Markdown support within code blocks.

## How to use it?

1. Insert a code block with the `flashcard` language tag.
2. Create a Q&A flashcard:

````markdown
```flashcard
Q: What is Obsidian?
A: Obsidian is a powerful knowledge base that works on top of a local folder of plain text Markdown files.
```
````

3. Create a cloze deletion flashcard::

````markdown
```flashcard
{{Obsidian}} is a powerful knowledge base that works on top of a local folder of plain text {{Markdown}} files.
```
````

4. Click on the flashcard to reveal the answer.
5. Optionally, configure the reveal method in the plugin settings.

## Demo

![Demo](demo.gif)

## Roadmap

1. Support `deck` fenced code block to group flashcards together. e.g.

````markdown
```deck
Q: What is Obsidian?
A: Obsidian is a powerful knowledge base that works on top of a local folder of plain text Markdown files.
---
{{Obsidian}} is a powerful knowledge base that works on top of a local folder of plain text {{Markdown}} files.
```
````

2. Implement spaced repetition algorithm.
3. A lot more to come!

## How to install

1. Install this plugin within Obsidian:

    - Open Settings > Community plugins
    - Make sure Safe mode is off
    - Click Browse community plugins
    - Search for "**Simple Flashcards**"
    - Click Install
    - Once installed, close the community plugins window and activate the newly installed plugin

2. Configure the plugin to your liking via the plugin settings accessible from the Obsidian settings panel.

## Contributing

Contributions are always welcome, whether in the form of bug reports, bug fixes, or feature ideas. Feel free to open an issue to discuss potential features or submit pull requests.

## Support

If you find this plugin helpful and wish to support ongoing development, consider buying me a coffee. Your support is greatly appreciated!

### GitHub Sponsors

<a style="margin-right: 20px;" href="https://www.github.com/sponsors/Railly">
  <img src="https://raw.githubusercontent.com/Railly/obsidian-simple-flashcards/master/github-sponsor.png" alt="Sponsor with GitHub" height="45px" />
</a>

### Buy Me a Coffee

<a href="https://www.buymeacoffee.com/raillyhugo" target="_blank">
	<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="45px">
</a>

### PayPal

<a href="https://www.paypal.com/donate/?hosted_button_id=J3PJ5N6LVZCPY">
  <img style="margin-right: 20px;" src="https://raw.githubusercontent.com/Railly/Railly/main/buttons/donate-with-paypal.png" alt="Donate with PayPal" height="45px" />
</a>

### Yape

<a href="https://donate.railly.dev?open-yape-dialog=true">
  <img style="margin-right: 20px;" src="https://raw.githubusercontent.com/Railly/donate/main/public/donate-with-yape.png" alt="Donate with PayPal" height="45px" />
</a>

### Features

-   🗃️ Standard Q&A flashcards
-   🎴 Cloze deletion flashcards for active recall
-   🔁 Customizable reveal methods (hover, button click, surface click)
-   🖋️ Inline cloze deletion with {{word}} syntax
-   🧠 Markdown support within code blocks.
