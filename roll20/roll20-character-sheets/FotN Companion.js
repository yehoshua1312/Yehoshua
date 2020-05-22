//Begin wyrd script
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
//End wyrd script

//Begin cleanup script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!cleanup\b/i.test(msg.content)) {
        const args = msg.content.split(/\s+--/);
        let theDeck = findObjs({
            _type: "deck",
            name: args[1]
        })[0];
        //test if deck exists
        if (!theDeck) {
            sendChat('cleanup', '/w gm Create a deck named ' + args[1]);
            return;
        }
        //Playmat graphic must be named $character_name+" playmat"
        let playmat = findObjs({
            _type: "graphic",
            name: args[1]+" playmat"
        })[0];
        //Check to make sure the playmat exists
        if (!playmat) {
            sendChat('Cleanup', '/w gm You need to name ' + args[1] + ' playmat');
            return;
        }
        //get the info for cards in play
        let cards = cardInfo({type: "play", deckid: theDeck.id})
        //get an array of IDs of selected cards
        let selectedArray = []
        if (msg.selected) {
            selectedArray = msg.selected.map(getID);
        } else {
            selectedArray = [];
        }
        if (cards) {
            //get an array of IDs of cards in play
            let cardIDs = cards.map(getID);
        } else {
            sendChat('Cleanup', '/w '+args[1]+' You dont have any cards in play');
            return;
        }
        //for each card
        for (let card of cards) {
            //if it isn't in wounded and isn't selected
            if (!woundCheck(playmat, card) && !selectedArray.includes(card.id)) {
                //pick up the card
                pickUpCard(card.cardid);
            } 
        }
        //return all the picked up cards and shuffle
        recallCards(theDeck.id, 'hand');
        shuffleDeck(theDeck.id);
    }
});

//Begin helper functions for cleanup
function getID(value) { //returns the id
    if (value._id) {
        return value._id;
    } else if (value.id) {
        return value.id
    }
}

function woundCheck(playmat, card) { 
    //checks to see if a rune is in a specific zone of the playmat. Returns true if it is.
    let cardObj = findObjs({
        id: card.id
    })[0];
    let leftBound = playmat.get('left')-playmat.get('width')/2; //set left side of playmat
    let bottomBound = playmat.get('top')+playmat.get('height')/2; //set bottom side of playmat
    let topBound = playmat.get('top')-playmat.get('height')/2; //set top side of playmat
    if (leftBound < cardObj.get('left') &&                      //checks to see if rune is within playmat bounds and at least 60% down the graphic
    cardObj.get('left') < leftBound + playmat.get('width') &&
    cardObj.get('top') < bottomBound &&
    0.6*playmat.get('height')+topBound < cardObj.get('top')) {
        return true;
    } else {
        return false;
    }
}
//End helper functions for cleanup
//End cleanup script

//Begin Condition Update script
//On change of a condition in the character sheet it updates the playmat with the new info
//Will create a text box on the playmat to hold info if one is not present
//Works with standard FotN playmat of any size, so long as the proportions remain the same
on('change:attribute', function(obj) {
    const conditions = { //contains relative position of each condition box in percent from left, top
        'blind':'92.0 6.3', 
        'degen':'80.0 15.4', 
        'curse':'93.9 16.2',
        'taunt':'91.1 29.9',
        'impeded':'93.2 37.1',
        'shroud':'94.0 48.1',
        'possession':'92.5 60.7',
        'rage':'91.4 71.3',
        'vulnerable':'91.4 80.0',
        'aura':'91.4 94.4'
    };
    if (Object.keys(conditions).includes(obj.get('name'))) { //if the attribute registered is contained as a key in the conditions variable
        let attribute = obj.get('name'); //get the name of the attribute
        let pageID = findObjs({ //get the page id for the playmats
            name: "Playmats"
        })[0].id;
        let char = findObjs({ //get the character that changed the attribute
            _id: obj.get('_characterid')
        })[0];
        let name = char.get('name')+"_"+attribute //make a reference formatted "$charName_attributeName"
        let text = findObjs({ //look for a textbox with the reference in the controlledby feild
            _type: "text",
            _pageid: pageID,
            controlledby: name
        })[0];
        if (text) {
            //If the textbox exists, simply update it with current data
            text.set('text', obj.get('current'));
        } else {
            //If it doesnt...
            let playmat =  findObjs({ //find the playmat for the activating character
                _type: "graphic",
                name: char.get('name')+" playmat"
            })[0];
            let split = conditions[attribute].split(' '); //get the position info for the condition and split it into left and top
            createObj('text', { //make a textbox object in the proper position, with the new information
               _pageid: pageID,
               text: obj.get('current'),
               font_family: "Arial",
               font_size: 32,
               layer: 'objects',
               controlledby: name,
               color: 'rgb(255, 255, 255)',
               top: (playmat.get('top')-0.5*playmat.get('height'))+Number(split[1])/100*playmat.get('height'),
               left: (playmat.get('left')-0.5*playmat.get('width'))+Number(split[0])/100*playmat.get('width')
            });
        }
    } else {
        break;
    }
});