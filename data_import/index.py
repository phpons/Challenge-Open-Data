import pandas as pd
import re
import numpy as np
import pycountry


def get_country_code(country_name):
  try:
    iso_code = pycountry.countries.lookup(country_name).alpha_2
  except:
    iso_code = ''
  return iso_code


def main():
  df = pd.read_csv('indicator_data.csv')

  # Drops unnecessary columns
  df = df.drop(['Series Code', 'Country Code'], 1)
  df = df.dropna()

  column_names = df.columns.values

  # Removes text between '[]' and '()' in the column headers, e.g. '2006 [YR2006]' => '2006'
  column_names = [re.sub('([\(\[]).*?([\)\]])', '', name).strip() for name in column_names] 
  df.columns = column_names

  # Gets the column headers that are not years
  indexes = [name for name in column_names if not any(c.isdigit() for c in name)]

  # Creates column 'Year' instead of having headers such as '2000 | 2001 | 2002 ...'
  df = df.melt(id_vars=indexes, var_name='Year', value_name='Value')

  # Turns indicators into column headers instead of row values
  pivoted = df.pivot(index=['Country Name', 'Year'], columns='Series Name', values='Value').reset_index()
  pivoted.columns.name = None
  df = pivoted

  columns = df.columns.values

  # Replaces '..' values with NaN (empty)
  for c in columns:
    df[c] = df[c].replace(['..'], np.NaN)
    df[df[c] == ''] = np.NaN

  df['Country Name'] = df['Country Name'].str.partition(',')[0]
  df['ISO_Country'] = df.apply(lambda x: get_country_code(x['Country Name']), axis=1)

  df = df[df['ISO_Country'] != '']
  df.loc[df['ISO_Country'] == '']
  df.to_csv('indicators_worldbank.csv')


if __name__ == "__main__":
    main()
