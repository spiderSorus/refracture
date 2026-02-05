use bevy::prelude::*;

mod components;
mod entities;
mod systems;
mod scenes;

use scenes::{GameState, MainMenuPlugin, BouncingCirclesScenePlugin};

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "refract".into(),
                resolution: (1580, 1020).into(),
                position: WindowPosition::Centered(MonitorSelection::Primary),
                ..default()
            }),
            ..default()
        }))
        .insert_resource(ClearColor(Color::BLACK))
        .init_state::<GameState>()
        .add_plugins(MainMenuPlugin)
        .add_plugins(BouncingCirclesScenePlugin)
        .add_systems(Startup, setup_camera)
        .run();
}

fn setup_camera(mut commands: Commands) {
    commands.spawn(Camera2d);
}
