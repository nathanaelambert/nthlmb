export class Instructions {
  constructor(gameLogic, gui){
    this.gameLogic = gameLogic;
    this.gui = gui;
    this.gameLogic.addObserver(this);
  }
   
  async update(phase) {
    if (phase === "instructions") {
      this.overlayDiv.style.display = 'block';
      await this.gui.play_instructions(); // Wait for instructions to finish
      console.log('instructions');
      this.gameLogic.instructions_clear(); // Now call when instructions have done playing
    } 
    if (phase === "search") {
      this.overlayDiv.style.display = 'none';
    } 
  }  
}
