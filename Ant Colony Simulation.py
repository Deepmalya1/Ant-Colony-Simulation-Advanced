import pygame
import random
import numpy as np

GRID_SIZE = 300
CELL_SIZE = 5
WINDOW_SIZE = GRID_SIZE * CELL_SIZE
PHEROMONE_DECAY = 0.01
PHEROMONE_INTENSITY = 255
DEFAULT_SPEED = 100
REPRODUCTION_INTERVAL = 10000
NEW_ANTS_COUNT = 2

BACKGROUND_COLOR = (0, 0, 0)
ANT_COLOR = (255, 0, 0)
QUEEN_COLOR = (255, 165, 0)
PHEROMONE_COLOR = (255, 255, 255)
BUTTON_COLOR = (50, 50, 50)
BUTTON_HOVER_COLOR = (100, 100, 100)
BUTTON_TEXT_COLOR = (255, 255, 255)

class Ant:
    def __init__(self, x, y, is_queen=False):
        self.x = x
        self.y = y
        self.is_queen = is_queen
        self.age = 0

    def move(self):
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        dx, dy = random.choice(directions)
        new_x = (self.x + dx) % GRID_SIZE
        new_y = (self.y + dy) % GRID_SIZE
        self.x, self.y = new_x, new_y

    def reproduce(self, ants):
        if self.is_queen:
            for _ in range(NEW_ANTS_COUNT):
                new_ant_x = (self.x + random.choice([-1, 1])) % GRID_SIZE
                new_ant_y = (self.y + random.choice([-1, 1])) % GRID_SIZE
                ants.append(Ant(new_ant_x, new_ant_y))

def draw_grid(screen, grid, ants, cell_size):
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            color_intensity = int(grid[y, x])
            color = (color_intensity, color_intensity, color_intensity)
            pygame.draw.rect(screen, color, (x * cell_size, y * cell_size, cell_size, cell_size))

    for ant in ants:
        color = QUEEN_COLOR if ant.is_queen else ANT_COLOR
        pygame.draw.rect(screen, color, (ant.x * cell_size, ant.y * cell_size, cell_size, cell_size))

def draw_button(screen, text, x, y, width, height):
    mouse = pygame.mouse.get_pos()
    click = pygame.mouse.get_pressed()

    
    button_rect = pygame.Rect(x, y, width, height)
    color = BUTTON_HOVER_COLOR if button_rect.collidepoint(mouse) else BUTTON_COLOR
    pygame.draw.rect(screen, color, button_rect)

    
    font = pygame.font.Font(None, 36)
    text_surface = font.render(text, True, BUTTON_TEXT_COLOR)
    text_rect = text_surface.get_rect(center=(x + width // 2, y + height // 2))
    screen.blit(text_surface, text_rect)

    return button_rect.collidepoint(mouse) and click[0]

def main():
    pygame.init()
    screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
    pygame.display.set_caption('Ant Colony Simulation')

    # Initialize pheromone grid
    pheromone_grid = np.zeros((GRID_SIZE, GRID_SIZE))

    # Initialize ants
    ants = [Ant(GRID_SIZE // 2, GRID_SIZE // 2, is_queen=True)]
    ants.append(Ant(GRID_SIZE // 2 + 1, GRID_SIZE // 2))

    clock = pygame.time.Clock()
    running = True
    paused = False
    zoom = 1
    speed = DEFAULT_SPEED
    frame_interval = 1000 // speed
    last_update_time = pygame.time.get_ticks()
    last_reproduction_time = pygame.time.get_ticks()

    while running:
        screen.fill(BACKGROUND_COLOR)
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

      
        start_clicked = draw_button(screen, "Start", 10, 10, 80, 40)
        stop_clicked = draw_button(screen, "Stop", 100, 10, 80, 40)
        fast_forward_clicked = draw_button(screen, "Fast", 190, 10, 80, 40)

        if start_clicked:
            paused = False
        if stop_clicked:
            paused = True
        if fast_forward_clicked:
            speed += 10
            frame_interval = 1000 // speed

        if not paused:
            current_time = pygame.time.get_ticks()
            if current_time - last_update_time >= frame_interval:
                last_update_time = current_time

                
                for ant in ants:
                    ant.move()
                    pheromone_grid[ant.y, ant.x] = min(PHEROMONE_INTENSITY, pheromone_grid[ant.y, ant.x] + PHEROMONE_INTENSITY)

                
                if current_time - last_reproduction_time >= REPRODUCTION_INTERVAL:
                    last_reproduction_time = current_time
                    for ant in ants:
                        ant.reproduce(ants)

                
                pheromone_grid = np.clip(pheromone_grid * (1 - PHEROMONE_DECAY), 0, PHEROMONE_INTENSITY)

            
                draw_grid(screen, pheromone_grid, ants, CELL_SIZE * zoom)

        clock.tick(speed)
        pygame.display.flip()

    pygame.quit()

if __name__ == '__main__':
    main()
