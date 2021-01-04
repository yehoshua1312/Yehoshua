README.txt

This archive contains a character sheet and companion script for Fate of the Norns: Ragnarok to be used with roll20.net. This is a BETA implimentation and is not guranteed to be stable, use at your own risk. This README assumes you already have some familiarity with the roll20 environment.

wyrd:
	This script draws runes from your deck and plays them to the playmat. The syntax of the command is thus:
	
	!wyrd --{character name} --{# runes} --{playmat zone} --{layer}

	Do not include the curly brackets when entering the command. 
	The character name must match the name of a deck and there must be a playmat named {character name} playmat. This variable is mandatory.
	Capitilization matters. 
	The {# runes} must be a positive intiger. This variable is mandatory.
	{playmat zone} can be one of: 'stun', 'wounds1', 'wounds2', 'wounds3', 'death', 'drain', or 'hand'. This variable is optional and will default to 'hand'. 'wounds1' plays to the white wounds track, 'wounds2' plays to the middle of the grey wounds track, and 'wounds3' plays to the middle of the black wounds track.
	{layer} can be 'objects', 'gmlayer', or 'maps' and determines the layer the runes are played to. It is optional and defaults to 'objects'

	Suggested Macros/Abilities:
	It is suggested that you set up an ability in each character sheet with the text: 
	!wyrd --@{character_name} --@{destiny} 
	(include the @ and curly brackets exactly as written). Using this ability will cause that character to wyrd their destiny in runes to hand.
	Some other suggested macros/abilities:
		Minor sacrifice:
		!wyrd --@{character_name} --1 --stun

		Moderate sacrifice:
		!wyrd --@{character_name} --1 --wounds2

		Major sacrifice:
		!wyrd --@{character_name} --1 --death

		Ultimate sacrifice:
		!wyrd --@{character_name} --1 --drain

cleanup:
	This script will return runes from the stun, essence, hand, contingency, and play to the deck and shuffle the deck. It will ignore runes in wounds, death, drain, and any runes that are selected.

	The syntax of the command is:

	!cleanup --{character name}

	The {character name} variable is mandatory and must corrospond to a deck.
	If there are runes in play you want to keep in play (such as maintained runes) you can shift select them to have them remain in play.

	Known Issues:
	1) For some reason this command must be issued twice. The first time you run it it may not detect the cards in play. It is recommended that you make a double command part of your macro/ability.
	2) Certain things (not always predictable) can cause the rune images in play to become unlinked from their card objects in the deck. If the cleanup command isn't working:
		1) check the script console for a crash. if it is crashed, restart the console
		2) run the cleanup command again
		3) check the deck you are trying to cleanup. If it says that it has its maximum number of cards in it then the images have become unlinked from the card object. The images on the playmat can be safely deleted at this point.

	Suggested Macros/Abilities:
	It is suggested that you set up an ability in each character sheet with the text:
	!cleanup --@{character_name}
	!cleanup --@{character_name}

	Yes, include the command twice on different lines.

build:
	This script will build a deck of runes with input from a character sheet or user.

	The syntax of the command is:

	!build --{character name} --{list of runes}

	If build is provided with a valid character name and there is already a deck with that name then it will remove the current runes in the deck use the runes listed in the active powers section of the character sheet to replace them. Deck formating is maintained.
	If build is provided with a valid character name and there is NOT a deck with that name then a new deck will be created with that name and filled with the runes from the active powers sectio of the character sheet. The deck will have the default settings for the roll20 game and may need to be modified.
	If build is not provided with a valid character name then it can be provided with a comma seperated list of quoted rune names (lower case) and it will build a deck with the provided name and runes. For instance, the command:

	!build --Bob --'ing', 'ehwo', 'kenaz'

	will first check to see if the character Bob exists, and if not it will create a deck named Bob with the ing, ehwo, and kenaz runes in it.

	build can accept any of the standard runes as input, as well as 'mental', 'physical', and 'spiritual'

alka:
	This script will place an alka token in the middle of the playfield

	The xyntax of the command is:

	!alka --{token type}

	where {token type} can be fire, ice, or magic. The token will always appear on the object layer in the middle of the field, where it can be moved and copied/deleted by any player.

