on('chat:message', (msg) => {
    if ('api' === msg.type && /!wyrd\b/i.test(msg.content)) {
            const args = msg.content.split(/\s+--/);
            //getid of deck
            //deck must have the same name as the character
        let theDeck = findObjs({
            _type: "deck",
            name: args[1]
        })[0];
        //test if deck exists
        if (!theDeck) {
            sendChat('Wyrd', '/w gm Create a deck named ' + args[1]);
            return;
        }
        //Playmat graphic must be named $character_name+" playmat"
        let playmat = findObjs({
            _type: "graphic",
            name: args[1]+" playmat"
        })[0];
        //Check to make sure the playmat exists
        if (!playmat) {
            sendChat('Wyrd', '/w gm You need to name ' + args[1] + ' playmat');
            return;
        }
        let pageID = findObjs({
            name: "Playmats"
        })[0].id;
        // Get the deck ID and list of cards in it
        let deckID = theDeck.id;
        let deckCards = theDeck.get('_currentDeck');
        var i;
        // Do a number of times equal to the character's destiny
        for (i = 0; i < args[2]; i++) {
            //If the number of cards in the deck isn't zero
            if (cardInfo({type: "deck", deckid: theDeck.id}).length) {
                //Draw a card
                let card = findObjs({
                    _id: drawCard(deckID)
                })[0];
                //Put the card on the playmat, will stagger cards so they don't all stack on top of eachother
                //These numbers are scaled to put the cards into the in hand area on my playmat. If you change
                //the playmat size you will need to change them
                playCardToTable(card.id, {left: playmat.get("left")+i*20-70, top: playmat.get("top")-110, pageid: pageID});
                //I don't know why this works, but it seems necessary to change the "controlledby" property
                let cardObj = findObjs({
                    cardid: card.id
                })[0];
                //Make it so that anyone can control the cards. If you change "all" to args[1] it should limit
                //control to the initiating player
                cardObj.set("controlledby", "all");
            } else {
                //If the deck is empty send a message to the player and exit
                sendChat('Wyrd', '/w '+args[1]+' your bag is empty');
                return;
            }
        }
    }
});