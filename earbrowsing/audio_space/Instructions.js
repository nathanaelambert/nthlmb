export class Instructions {
  constructor(gameLogic, gui){
    this.gameLogic = gameLogic;
    this.gui = gui;
    this.gameLogic.addObserver(this);
  }
   
  async update(data) {
    if (data.phase === "instructions") {
      const overlay = document.getElementById('instructionsOverlay');
      if (overlay) overlay.style.display = 'block';
      await this.gui.play_instructions(); // Wait for instructions to finish
      // console.log('You heard that ?');
      this.gameLogic.instructions_clear(); // Now call when instructions have done playing
    } 
    if (data.phase === "search") {
      const overlay = document.getElementById('instructionsOverlay');
      if (overlay) overlay.style.display = 'none';
    } 
  }  
}
