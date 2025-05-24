// stores/usePracticeStore.ts
import { defineStore } from 'pinia'

export const usePracticeStore = defineStore('practice', {
  state: () => ({
    currentSubject: '',
    currentBook: null,
    currentBookID: null,
    selectedQuestions: [],
    startPractice: false,
    isFinished: false,
    practiceResult: {
      questions: [],
      timeSpent: '00:00',
    },
  }),
  actions: {
    setCurrentBook(book) {
      this.currentBook = book
      this.currentBookID = book.QuestionBook_ID
      this.currentSubject = book.BName
    },
    setQuestions(questions) {
      this.selectedQuestions = questions
      this.startPractice = true
    },
    finishPractice(result) {
      this.isFinished = true
      this.practiceResult = result
    },
    resetPractice() {
      this.startPractice = false
      this.isFinished = false
      this.practiceResult = {
        questions: [],
        timeSpent: '00:00',
      }
    },
  },
})
