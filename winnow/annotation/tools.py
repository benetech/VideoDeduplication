import pandas as pd 
from .utils import create_interface

class Annotator:

    def __init__(self,report_path,save_path,annotation_label = 'is_match',annotation_default_value=-1,transform_query_path=True):

        self.report_path = report_path
        self.save_path = save_path
        self.annotation_label = annotation_label
        self.annotation_default_value = annotation_default_value
        self.transform_query_path = transform_query_path
        self.matches_df = None
        self.unique_qs = None
        self.build()

    def build(self):

        self.matches_df = pd.read_csv(self.report_path)
        
        if self.annotation_label not in self.matches_df.columns:
            print('Creating new column for annotation: {} - default value: {}'.format(self.annotation_label,self.annotation_default_value))
            self.matches_df[self.annotation_label] = self.annotation_default_value
        else:
            print('Previous annotations loaded')
            print(self.matches_df[self.annotation_label].value_counts())


        self.unique_qs = self.matches_df['query_video'].unique()




    def run(self):

        grid = create_interface(self.matches_df,self.save_path,self.annotation_label,transform_query_path=self.transform_query_path)
        return grid


    def summary(self):


        return pd.crosstab(self.matches_df['query_video'],
            self.matches_df[self.annotation_label],
            aggfunc='count',
            values=self.matches_df[self.annotation_label],
            margins=True).fillna(0).sort_values('All',ascending=False)



