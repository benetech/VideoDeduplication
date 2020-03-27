import os
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display
from ipywidgets import interact, interactive, fixed, interact_manual,Button,Layout,GridspecLayout,Output



def create_expanded_button(description, button_style):
    return Button(description=description, button_style=button_style, layout=Layout(height='auto', width='auto'))


def create_interface(matches_df,save_path,annotation_label,transform_query_path = True,frames_directory=None):

    # Create Buttons 
    a = create_expanded_button('Next Video', 'info')
    b = create_expanded_button('Previous Video', 'info')
    c = create_expanded_button('Next Query', 'info')
    d = create_expanded_button('Previous Query', 'info')
    e = create_expanded_button('Save', 'warning')
    f = create_expanded_button('Match', 'success')
    g = create_expanded_button('Not a Match', 'danger')

    # Create Outputs to be later assigned 

    output = Output()
    output_2 = Output()
    output_desc = Output()
    output_2_desc = Output()



    # Create event handlers and other utility functions

    def click_save(b):
        fn = save_path
        matches_df.to_csv(fn)
        print("Saved on {}".format(fn))


    def create_strip(frames,beg):
            
        if frames.shape[0] < 1:
            print(frames.shape)
            plt.figure(figsize=(5 * frames.shape[0],10))
        else:
            plt.figure(figsize=(20,10))
            

        plt.imshow(np.hstack(frames[beg::][:5]))
        plt.show()

    def get_frame_summary(idx,video_list,beg=0,transform_query_path = True):
        
        fp = video_list[idx]
        if transform_query_path:
            FRAMES_PATH = os.path.join(frames_directory,fp+'_vgg_frames.npy')
        else:
            FRAMES_PATH = fp 
        
        frames = np.load(FRAMES_PATH)
    
        
        interact(create_strip,frames=fixed(frames),beg=(0,len(frames) // 5))
        
    def display_row(out,info):

        with out:
            out.clear_output()
            info_var = ['query_video','match_video','distance',annotation_label]
            for el in info_var:
                
                print("{}:{}".format(el,info[el]))

    def reset_current_video_match():
        with output:
            output.clear_output()
            global i,filtered
            i = 0
            print('Match Video - {} / {}'.format(i + 1,len(filtered)))
            get_frame_summary(i,filtered['match_video'].values)
            display_row(output_desc,filtered.iloc[i,:])
        
        
    def move_video_match(inc):
        global i
        i+=inc
        i = max(0,i)
        i = min(len(filtered)-1,i)
        print('Match Video - {} / {}'.format(i + 1,len(filtered)))

    def move_query_video(inc):
        global j,msk,filtered
        j+=inc
        j = max(0,j)
        j = min(len(unique_qs)-1,j)
        msk = matches_df['query_video'] == unique_qs[j]
        filtered = matches_df.loc[msk,:]
        print('Query Video - {} / {}'.format(j + 1,len(unique_qs)))

        
        
        
    def on_button_clicked_is_match(b):
        with output:
            output.clear_output()
            global i,filtered
            original_index = filtered.index[i]
            filtered.loc[original_index,annotation_label] = 1
            matches_df.loc[original_index,annotation_label] = 1
            move_video_match(1)
            get_frame_summary(i,filtered['match_video'].values)
            display_row(output_desc,filtered.iloc[i,:])

        
        
    def on_button_clicked_not_match(b):
        with output:
            output.clear_output()
            global i,filtered
            original_index = filtered.index[i]
            filtered.loc[original_index,annotation_label] = 0
            matches_df.loc[original_index,annotation_label] = 0
            move_video_match(1)    
            get_frame_summary(i,filtered['match_video'].values)
            display_row(output_desc,filtered.iloc[i,:])

    def on_button_clicked_next_video_match(b):
        with output:
            output.clear_output()
            move_video_match(1)
            get_frame_summary(i,filtered['match_video'].values)
            display_row(output_desc,filtered.iloc[i,:])
            

    def on_button_previous_video_match(b):
        with output:
            output.clear_output()
            move_video_match(-1)
            get_frame_summary(i,filtered['match_video'].values)
            display_row(output_desc,filtered.iloc[i,:])
            
            
    def on_button_clicked_query(b):
        with output_2:
            output_2.clear_output()
            move_query_video(1)
            get_frame_summary(j,unique_qs,transform_query_path=transform_query_path)
            reset_current_video_match()
            
        

    def on_button_previous_video_query(b):
        with output_2:
            output_2.clear_output()
            move_query_video(-1)
            get_frame_summary(j,unique_qs,transform_query_path=transform_query_path)
            reset_current_video_match()
            

    a.on_click(on_button_clicked_next_video_match)
    b.on_click(on_button_previous_video_match)
    c.on_click(on_button_clicked_query)
    d.on_click(on_button_previous_video_query)
    g.on_click(on_button_clicked_not_match)
    f.on_click(on_button_clicked_is_match)
    e.on_click(click_save)



    global i,j,msk,filtered
    i = 0 
    j = 0
    unique_qs = matches_df['query_video'].unique()
    msk = matches_df['query_video'] == unique_qs[j]
    filtered = matches_df.loc[msk]


    # Initialize outputs with first  
    with output_2:
        print('Query Video - {} / {}'.format(j + 1,len(unique_qs)))
        get_frame_summary(j,unique_qs,transform_query_path=transform_query_path)
    with output:
        print('Match Video - {} / {}'.format(i + 1,len(filtered)))
        get_frame_summary(i,filtered['match_video'].values)
        display_row(output_desc,filtered.iloc[i,:])

    grid = GridspecLayout(8, 4, height='1000px')
    

    grid[0,:] = output_desc
    grid[1:3, :] = output_2
    grid[3:5, :] = output

    grid[5, 1] = g
    grid[5, 2] = f

    grid[6, 0] = d
    grid[6, 1] = c
    grid[6, 2] = b
    grid[6, 3] = a
    grid[7, 3] = e

    return grid

