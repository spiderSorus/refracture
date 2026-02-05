use bevy::prelude::*;

pub mod bouncing_circles;
pub mod main_menu;

pub use bouncing_circles::BouncingCirclesScenePlugin;
pub use main_menu::MainMenuPlugin;

#[derive(States, Debug, Clone, PartialEq, Eq, Hash, Default)]
pub enum GameState {
    #[default]
    MainMenu,
    BouncingBalls,
}