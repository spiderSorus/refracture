use bevy::prelude::*;
use super::GameState;

pub struct MainMenuPlugin;

impl Plugin for MainMenuPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(OnEnter(GameState::MainMenu), setup_menu)
           .add_systems(Update, button_system.run_if(in_state(GameState::MainMenu)))
           .add_systems(Update, handle_escape.run_if(in_state(GameState::MainMenu)))
           .add_systems(OnExit(GameState::MainMenu), cleanup_menu);
    }
}

#[derive(Component)]
struct MainMenuUI;

#[derive(Component)]
struct BouncingBallsButton;

fn setup_menu(mut commands: Commands) {
    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                flex_direction: FlexDirection::Column,
                ..default()
            },
            MainMenuUI,
        ))
        .with_children(|parent| {
            // Button
            parent
                .spawn((
                    Button,
                    Node {
                        width: Val::Px(250.0),
                        height: Val::Px(65.0),
                        justify_content: JustifyContent::Center,
                        align_items: AlignItems::Center,
                        ..default()
                    },
                    BackgroundColor(Color::srgb(0.15, 0.15, 0.15)),
                    BouncingBallsButton,
                ))
                .with_children(|parent| {
                    parent.spawn((
                        Text::new("00_bouncing_balls"),
                        TextFont {
                            font_size: 24.0,
                            ..default()
                        },
                        TextColor(Color::srgb(0.9, 0.9, 0.9)),
                    ));
                });
        });
}

fn handle_escape(keyboard: Res<ButtonInput<KeyCode>>) {
    if keyboard.just_pressed(KeyCode::Escape) {
        std::process::exit(0);
    }
}

fn button_system(
    mut interaction_query: Query<
        (&Interaction, &mut BackgroundColor),
        (Changed<Interaction>, With<BouncingBallsButton>),
    >,
    mut next_state: ResMut<NextState<GameState>>,
) {
    for (interaction, mut color) in &mut interaction_query {
        match *interaction {
            Interaction::Pressed => {
                *color = BackgroundColor(Color::srgb(0.35, 0.35, 0.35));
                next_state.set(GameState::BouncingBalls);
            }
            Interaction::Hovered => {
                *color = BackgroundColor(Color::srgb(0.25, 0.25, 0.25));
            }
            Interaction::None => {
                *color = BackgroundColor(Color::srgb(0.15, 0.15, 0.15));
            }
        }
    }
}

fn cleanup_menu(
    mut commands: Commands,
    menu_query: Query<Entity, With<MainMenuUI>>,
    children_query: Query<&Children>,
) {
    for entity in &menu_query {
        // Despawn all children recursively
        despawn_with_children(&mut commands, entity, &children_query);
    }
}

fn despawn_with_children(
    commands: &mut Commands,
    entity: Entity,
    children_query: &Query<&Children>,
) {
    if let Ok(children) = children_query.get(entity) {
        for child in children.iter() {
            despawn_with_children(commands, child, children_query);
        }
    }
    commands.entity(entity).despawn();
}
