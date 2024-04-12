import { User } from "@/models/user";
import { Issue } from "@/models/issue";
import { observer } from "mobx-react-lite";

export const Linear = observer(() => {
  const user = User({
    id: "1",
    name: "John Doe",
  });

  // const issue = Issue({
  //   id: "1",
  //   title: "Fix bug",
  //   assignee: user,
  // });

  // const handleSave = () => {
  //   user.name = "John Smith";
  //   user.save();
  // };

  return (
    <div>
      {/* <h1>User: {user.name}</h1> */}
      <h2>Assigned Issues:</h2>
      {/* <ul>
        {user.issues.map((issue) => (
          <li key={issue.id}>{issue.title}</li>
        ))}
      </ul> */}
      {/* <button onClick={handleSave}>Save</button> */}
    </div>
  );
});
