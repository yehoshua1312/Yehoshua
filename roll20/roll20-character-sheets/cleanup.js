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

function getID(value) {
    if (value._id) {
        return value._id;
    } else if (value.id) {
        return value.id
    }
}

function woundCheck(playmat, card) {
    let cardObj = findObjs({
        id: card.id
    })[0];
    let leftBound = playmat.get('left')-playmat.get('width')/2;
    let bottomBound = playmat.get('top')+playmat.get('height')/2;
    let topBound = playmat.get('top')-playmat.get('height')/2;
    if (leftBound < cardObj.get('left') && 
    cardObj.get('left') < leftBound + playmat.get('width') &&
    cardObj.get('top') < bottomBound &&
    0.6*playmat.get('height')+topBound < cardObj.get('top')) {
        return true;
    } else {
        return false;
    }
}