with open('labels') as f:
	content = f.readlines()

print(
'''<div class="table-container">
  <table class="table is-hoverable">
    <thead>
      <tr>
        <th>#</th>
        <th>Column</th>
        <th>Description</th>
        <th>Type</th>
        <th>Values</th>
      </tr>
    </thead>
    <tbody>'''
)
for idx, line in enumerate(content):
	parts = line.split('\t')
	print(
f'''      <tr>
        <th>{idx}</th>
        <td>{parts[0]}</td>
        <td>{parts[2].strip()}</td>
        <td>{parts[1]}</td>
        <td></td>
      </tr>''')
print('''    </tbody>
  </table>
</div>''')
