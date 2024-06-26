import React, { useContext } from "react";
import "../../styles/pages/Blog/CreateContentNavbar.css";
import toast from "react-hot-toast";
import { UserContext } from "../../contexts/UserContext";
import { EditorContext } from "../../pages/Blog/BlogContentsEditor";
import { Link, useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CreateContentNavbar = () => {
  const {
    blog,
    blog: { title, banner, content, tags, description },
    textEditor,
    setEditorState,
    setBlog,
  } = useContext(EditorContext);

  // To destructure the access token from the UserContext and use it before publishing the blog
  let { accessToken } = useContext(UserContext);
  // console.log("Access token:", accessToken);

  const navigate = useNavigate();

  const handlePublish = () => {
    if (!banner.length) {
      return toast.error("Please upload a blog banner to publish it");
    }

    if (!title.length) {
      return toast.error("Please fill the blog title to publish it!");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          // console.log(data);
          if (data.blocks.length) {
            // To update the content key in the blog structure
            setBlog({ ...blog, content: data });
            // This is to change the editor state when it is published
            setEditorState("publish");
          } else {
            return toast.error(
              "Please write something in the blog to publish it!"
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // To handle the blog draft submission
  const handleSaveDraft = async (e) => {
    e.preventDefault();

    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Please write the blog title to save as a draft!");
    }

    let loadingToast = toast.loading("Saving Draft...");
    // To disable the publish button from being double clicked when in publishing process
    e.target.classList.add("disable");

    try {
      if (textEditor.isReady) {
        const content = await textEditor.save();

        const response = await fetch(`${BACKEND_URL}/blog/create-blog`, {
          method: "POST",
          body: JSON.stringify({
            title,
            banner,
            description,
            content,
            tags,
            draft: true,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        const data = await response.json();

        console.log(data);

        // setBlog(data);
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success(
          "Draft saved Successfully, you can always continue later. 🥳👍"
        );
        navigate("/");
      } else {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.error("Text editor is not ready yet. Please try again.");
      }
    } catch (err) {
      e.target.classList.remove("disable");
      toast.dismiss(loadingToast);
      console.log(err);
      return toast.error(err.error);
    }
  };

  return (
    <nav className="create-content-nav">
      <div>
        <Link to="/">
          <i class="fa-solid fa-backward"></i>
        </Link>
        <h4>{title.length ? title : "New Blog 📝"} </h4>
      </div>

      <div>
        <button className="publish" onClick={handlePublish}>
          Publish
        </button>
        <button className="draft" onClick={handleSaveDraft}>
          Save Draft
        </button>
      </div>
    </nav>
  );
};

export default CreateContentNavbar;
